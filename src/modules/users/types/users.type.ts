import { AuthenticatedRequest } from '../../../middlewares/authenticate';
import { User } from '@prisma/client';

export type UserWithGrade = User & {
  grade: { id: string; name: string; rate: number; minAmount: number } | null;
};

export type UserUpdateData = {
  name?: string;
  email?: string;
  passwordHash?: string;
  imageUrl?: string | null;
  imageKey?: string | null;
};

export type UsersMulterRequest = AuthenticatedRequest & {
  file?: Express.Multer.File;
};

export type StoreFavoriteWithStore = {
  storeId: string;
  userId: string;
  store: {
    id: string;
    sellerId: string;
    name: string;
    address: string;
    detailAddress: string;
    phoneNumber: string;
    content: string;
    imageUrl: string | null;
    imageKey: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};
