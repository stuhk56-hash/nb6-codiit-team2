import * as express from 'express';
import 'dotenv/config';
<<<<<<< HEAD
import express from 'express';
import cookieParser from 'cookie-parser';
import { setupRoutes } from './app.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from './middlewares/errorHandler';
import { corsMiddleware } from './middlewares/cors';
=======
import { ENV } from './configs/env.js';
import { errorHandler, notFoundHandler } from './errors/error-handler.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import {
  createInquiriesModuleRouter,
  inquiriesBasePath,
} from './modules/inquiries/inquiries.module.js';
>>>>>>> aaed4e6 (feat: Express와 superstruct 기반 문의 모듈 구현)

const app = express();

app.use(express.json());
<<<<<<< HEAD
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(corsMiddleware);
app.use(cookieParser());

setupRoutes(app);
app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

const port = Number(process.env.PORT ?? '3000');
app.listen(port);
=======
app.use(loggerMiddleware);
app.use(authMiddleware);

app.use(inquiriesBasePath, createInquiriesModuleRouter());

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(ENV.PORT || 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
>>>>>>> aaed4e6 (feat: Express와 superstruct 기반 문의 모듈 구현)
