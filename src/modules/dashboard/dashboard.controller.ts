import type { Response } from 'express';
import { requireAuthUser } from '../../lib/request/auth-user';
import type { AuthenticatedRequest } from '../../middlewares/authenticate';
import { dashboardService } from './dashboard.service';

export async function findDashboard(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const dashboard = await dashboardService.findDashboard(authUser);
  res.send(dashboard);
}
