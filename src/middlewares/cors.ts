import cors from 'cors';

function parseAllowedOrigins() {
  return (process.env.CORS_ORIGIN ?? '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const ALLOWED_METHODS = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'];
const ALLOWED_HEADERS = ['Content-Type', 'Authorization'];

export const corsMiddleware = cors({
  origin(origin, callback) {
    const allowedOrigins = parseAllowedOrigins();

    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes('*')) {
      callback(null, true);
      return;
    }

    callback(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ALLOWED_METHODS,
  allowedHeaders: ALLOWED_HEADERS,
  optionsSuccessStatus: 204,
});
