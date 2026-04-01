import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { setupRoutes } from './app.module';
import {
  defaultNotFoundHandler,
  globalErrorHandler,
} from './middlewares/errorHandler';
import { corsMiddleware } from './middlewares/cors';
import { startStoreBusinessInfoPurgeScheduler } from './modules/stores/jobs/store-business-info-purge.job';
import { helmetMiddleware } from './middlewares/security';
import { setupSwagger } from './swagger';

const app = express();

app.use(helmetMiddleware);
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(corsMiddleware);
app.use(cookieParser());

setupSwagger(app);
app.get('/', (_, res) => {
  res.status(200).send('NB6 TEAM2 Codi-it');
});
setupRoutes(app);
app.use(defaultNotFoundHandler);
app.use(globalErrorHandler);

const port = Number(process.env.PORT ?? '3000');
app.listen(port);
startStoreBusinessInfoPurgeScheduler();
