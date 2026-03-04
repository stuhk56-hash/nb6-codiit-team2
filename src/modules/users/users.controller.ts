import { Request, Response } from 'express';
import { create as structCreate } from 'superstruct';
import { requireAuthUser } from '../../lib/request/auth-user';
import { AuthenticatedRequest } from '../../middlewares/authenticate';
import { CreateUserBodyStruct, UpdateMeBodyStruct } from './structs/users.struct';
import { UsersMulterRequest } from './types/users.type';
import { usersService } from './users.service';

export async function create(req: Request, res: Response) {
  const body = structCreate(req.body, CreateUserBodyStruct);
  const user = await usersService.create(body);
  res.status(201).send(user);
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const user = await usersService.getMe(authUser.id);
  res.send(user);
}

export async function updateMe(req: UsersMulterRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const image = req.file;
  const body = structCreate(req.body, UpdateMeBodyStruct);
  const user = await usersService.updateMe(authUser.id, body, image);
  res.send(user);
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  await usersService.deleteUser(authUser.id);
  res.status(200).send({ message: '회원 탈퇴 성공' });
}

export async function getLikedStores(req: AuthenticatedRequest, res: Response) {
  const authUser = requireAuthUser(req);
  const stores = await usersService.getLikedStores(authUser.id);
  res.send(stores);
}
