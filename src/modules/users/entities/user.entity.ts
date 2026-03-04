import { UserType } from '@prisma/client';

export interface UserEntity {
  id: string;
  type: UserType;
  email: string;
  name: string;
  passwordHash: string;
  imageUrl: string | null;
  imageKey: string | null;
  points: number;
  gradeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
