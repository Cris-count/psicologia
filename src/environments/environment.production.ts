/** Producción MIND-SPHERE — mismo subdominio RPM registrado en Studio. */
export const environment = {
  production: true,
  rpm: {
    subdomain: 'mindsphere',
    creator: {
      bodyType: 'fullbody' as const,
      language: 'es',
      quickStart: true,
      clearCache: false,
    },
  },
};
