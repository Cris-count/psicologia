/**
 * Ready Player Me — MIND-SPHERE
 * Dev: `demo` funciona sin registrar subdominio.
 * Prod: registrar `mindsphere` en https://studio.readyplayer.me
 */
export const environment = {
  production: false,
  rpm: {
    subdomain: 'demo',
    creator: {
      bodyType: 'fullbody' as const,
      language: 'es',
      quickStart: true,
      clearCache: false,
    },
  },
};
