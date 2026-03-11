import { UserType } from '@prisma/client';
import * as s from 'superstruct';
import { emailString } from '../../../lib/validation/struct-helpers';

const PasswordStruct = s.size(s.string(), 8, 20);

export const CreateUserBodyStruct = s.type({
  type: s.optional(s.enums(Object.values(UserType))),
  name: s.size(s.string(), 2, 10),
  email: emailString,
  password: PasswordStruct,
});

export const UpdateMeBodyStruct = s.type({
  currentPassword: PasswordStruct,
  name: s.optional(s.size(s.string(), 2, 10)),
  email: s.optional(emailString),
  password: s.optional(PasswordStruct),
});
