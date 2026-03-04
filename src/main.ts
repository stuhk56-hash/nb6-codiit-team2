import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { setupRoutes } from './app.module';
import { defaultNotFoundHandler, globalErrorHandler } from './middlewares/errorHandler';
import { corsMiddleware } from './middlewares/cors';

const app = express();

app.use(express.json());
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
