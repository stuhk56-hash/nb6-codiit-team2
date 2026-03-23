import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import { findDashboard } from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/', authenticate(), withAsync(findDashboard));
