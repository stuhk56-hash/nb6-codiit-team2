import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import {
  authenticate,
  authenticateOptional,
} from '../../middlewares/authenticate';
import {
  create,
  createInquiry,
  findList,
  findProduct,
  getListInquiry,
  remove,
  update,
} from './products.controller';
import { productsUpload } from './products.upload';

export const productsRouter = Router();

productsRouter.post('/', authenticate(), productsUpload, withAsync(create));
productsRouter.get('/', withAsync(findList));
productsRouter.patch(
  '/:productId',
  authenticate(),
  productsUpload,
  withAsync(update),
);
productsRouter.get('/:productId', withAsync(findProduct));
productsRouter.delete('/:productId', authenticate(), withAsync(remove));
productsRouter.post(
  '/:productId/inquiries',
  authenticate(),
  withAsync(createInquiry),
);
productsRouter.get(
  '/:productId/inquiries',
  authenticateOptional(),
  withAsync(getListInquiry),
);
