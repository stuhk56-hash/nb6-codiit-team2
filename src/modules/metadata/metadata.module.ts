import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { getGrade } from './metadata.controller';

export const metadataRouter = Router();

metadataRouter.get('/grade', withAsync(getGrade));
