import { Request, Response } from 'express';
import { create as structCreate } from 'superstruct';
import { requireAuthUser } from '../../lib/request/auth-user';
import { AuthenticatedRequest } from '../../middlewares/authenticate';
import { productsService } from './products.service';
import {
  CreateProductBodyStruct,
  CreateProductInquiryBodyStruct,
  ProductInquiryListQueryStruct,
  ProductListQueryStruct,
  ProductParamsStruct,
  UpdateProductBodyStruct,
} from './structs/products.struct';
import { ProductsMulterRequest } from './types/products.type';

export async function create(req: ProductsMulterRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const body = structCreate(req.body, CreateProductBodyStruct);
  const product = await productsService.create(authUser, body, req.file);
  res.status(201).send(product);
}

export async function findList(req: Request, res: Response) {
  const query = structCreate(req.query, ProductListQueryStruct);
  const products = await productsService.findList(query);

  res.send(products);
}

export async function findProduct(req: Request, res: Response) {
  const params = structCreate(req.params, ProductParamsStruct);
  const product = await productsService.findProduct(params.productId);
  res.send(product);
}

export async function update(req: ProductsMulterRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, ProductParamsStruct);
  const body = structCreate(req.body, UpdateProductBodyStruct);
  const product = await productsService.update(
    authUser,
    params.productId,
    body,
    req.file,
  );
  res.send(product);
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, ProductParamsStruct);
  await productsService.remove(authUser, params.productId);
  res.status(204).end();
}

export async function createInquiry(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const params = structCreate(req.params, ProductParamsStruct);
  const body = structCreate(req.body, CreateProductInquiryBodyStruct);
  const inquiry = await productsService.createInquiry(
    authUser,
    params.productId,
    body,
  );
  res.status(201).send(inquiry);
}

export async function getListInquiry(
  req: AuthenticatedRequest,
  res: Response,
) {
  const params = structCreate(req.params, ProductParamsStruct);
  const query = structCreate(req.query, ProductInquiryListQueryStruct);
  const result = await productsService.getListInquiry(
    params.productId,
    query,
    req.user,
  );
  res.send(result);
}
