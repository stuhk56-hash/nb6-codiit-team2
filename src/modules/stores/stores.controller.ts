import type { Response } from 'express';
import { create as structCreate } from 'superstruct';
import { requireAuthUser, requireSeller } from '../../lib/request/auth-user';
import type { AuthenticatedRequest } from '../../middlewares/authenticate';
import { storesService } from './stores.service';
import {
  CreateStoreBodyStruct,
  MyStoreProductsQueryStruct,
  StoreParamsStruct,
  UpdateStoreBodyStruct,
} from './structs/stores.struct';
import type {
  MyStoreProductsQuery,
  StoresMulterRequest,
} from './types/stores.type';

export async function create(req: StoresMulterRequest, res: Response) {
  const authUser = requireSeller(requireAuthUser(req), '접근 권한이 없습니다.');
  const body = structCreate(req.body, CreateStoreBodyStruct);
  const store = await storesService.create(authUser.id, body, req.file);
  res.status(201).send(store);
}

export async function update(req: StoresMulterRequest, res: Response) {
  const authUser = requireSeller(requireAuthUser(req), '접근 권한이 없습니다.');
  const params = structCreate(req.params, StoreParamsStruct);
  const body = structCreate(req.body, UpdateStoreBodyStruct);
  const store = await storesService.update(
    authUser.id,
    params.storeId,
    body,
    req.file,
  );
  res.send(store);
}

export async function findStore(req: AuthenticatedRequest, res: Response) {
  const params = structCreate(req.params, StoreParamsStruct);
  const store = await storesService.findStore(params.storeId);
  res.send(store);
}

export async function myStore(req: AuthenticatedRequest, res: Response) {
  const authUser = requireSeller(requireAuthUser(req), '접근 권한이 없습니다.');
  const store = await storesService.myStore(authUser.id);
  res.send(store);
}

export async function myStoreProduct(req: AuthenticatedRequest, res: Response) {
  const authUser = requireSeller(requireAuthUser(req), '접근 권한이 없습니다.');
  const query: MyStoreProductsQuery = structCreate(
    req.query,
    MyStoreProductsQueryStruct,
  );
  const products = await storesService.myStoreProduct(authUser.id, query);
  res.send(products);
}

export async function favoriteStoreRegister(
  req: AuthenticatedRequest,
  res: Response,
) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, StoreParamsStruct);
  const result = await storesService.favoriteStoreRegister(
    authUser.id,
    params.storeId,
  );
  res.status(201).send(result);
}

export async function favoriteStoreDelete(
  req: AuthenticatedRequest,
  res: Response,
) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, StoreParamsStruct);
  const result = await storesService.favoriteStoreDelete(
    authUser.id,
    params.storeId,
  );
  res.send(result);
}
