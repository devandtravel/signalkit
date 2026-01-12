
import handler from '../dist/server/server.js';

export default async function (req, res) {
  try {
    const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
    const url = new URL(req.url, origin);

    const controller = new AbortController();
    req.on('close', () => controller.abort());

    const init = {
      method: req.method,
      headers: req.headers,
      signal: controller.signal,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = req;
      init.duplex = 'half';
    }

    const request = new Request(url.href, init);
    
    // The handler from TanStack Start server build expects a web Request
    const response = await handler.fetch(request);

    res.statusCode = response.status;
    res.statusMessage = response.statusText;

    // Handle headers
    response.headers.forEach((value, key) => {
      if (key === 'set-cookie' && typeof response.headers.getSetCookie === 'function') {
        // Skip here, handle via getSetCookie to preserve multiple cookies
        return;
      }
      res.setHeader(key, value);
    });

    if (typeof response.headers.getSetCookie === 'function') {
        const cookies = response.headers.getSetCookie();
        if (cookies && cookies.length > 0) {
            res.setHeader('set-cookie', cookies);
        }
    }

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    
    res.end();
  } catch (error) {
    console.error('Error serving request in Vercel adapter:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
