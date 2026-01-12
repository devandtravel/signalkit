import { createStartHandler, defaultRenderHandler, defaultStreamHandler } from "@tanstack/react-start/server";

export default createStartHandler(defaultRenderHandler);

export const streamHandler = defaultStreamHandler;
