export interface CodebaseMarker {
  marker: string;
  impact: string;
  status: 'modern' | 'legacy';
}

export interface CodebaseAge {
  year: number;
  status: string;
  points: CodebaseMarker[];
}

export function getMockCodebaseAge(repoId: number): CodebaseAge {
  // Use repoId to determine the archetype
  if (repoId >= 300 && repoId < 400) { // Enterprise Legacy
    return {
      year: 2017,
      status: 'Maintenance Mode',
      points: [
        { marker: 'React 16.2', impact: '-3 years', status: 'legacy' },
        { marker: 'Webpack 3', impact: '-2 years', status: 'legacy' },
        { marker: 'Redux Saga', impact: '-1 year', status: 'legacy' },
        { marker: 'High JS:TS Ratio', impact: '-2 years', status: 'legacy' }
      ]
    };
  }

  if (repoId >= 200 && repoId < 300) { // Startup
    return {
      year: 2024,
      status: 'Bleeding Edge',
      points: [
        { marker: 'React 18.3', impact: '+2 years', status: 'modern' },
        { marker: 'Vite 5', impact: '+2 years', status: 'modern' },
        { marker: 'TanStack Query', impact: '+1 year', status: 'modern' },
        { marker: '100% TypeScript', impact: '+1 year', status: 'modern' }
      ]
    };
  }

  // Default / Hobby / Mid-range
  return {
    year: 2021,
    status: 'Stable / Mature',
    points: [
      { marker: 'React 17', impact: '0 years', status: 'modern' },
      { marker: 'Webpack 5', impact: '+1 year', status: 'modern' },
      { marker: 'TypeScript 4.x', impact: '0 years', status: 'modern' },
      { marker: 'Standard React Hooks', impact: '+1 year', status: 'modern' }
    ]
  };
}
