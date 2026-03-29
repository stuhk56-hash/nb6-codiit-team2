import { Router } from 'express';
import { withAsync } from '../../lib/withAsync';
import { authenticate } from '../../middlewares/authenticate';
import { storesUpload } from './store.upload';
import {
  create,
  favoriteStoreDelete,
  favoriteStoreRegister,
  findStore,
  myStore,
  myStoreProduct,
  update,
} from './stores.controller';

export const storesRouter = Router();

storesRouter.post('/', authenticate(), storesUpload, withAsync(create));
storesRouter.get('/detail/my', authenticate(), withAsync(myStore));
storesRouter.get(
  '/detail/my/product',
  authenticate(),
  withAsync(myStoreProduct),
);
storesRouter.patch(
  '/:storeId',
  authenticate(),
  storesUpload,
  withAsync(update),
);
storesRouter.get('/:storeId', withAsync(findStore));
storesRouter.post(
  '/:storeId/favorite',
  authenticate(),
  withAsync(favoriteStoreRegister),
);
storesRouter.delete(
  '/:storeId/favorite',
  authenticate(),
  withAsync(favoriteStoreDelete),
);
