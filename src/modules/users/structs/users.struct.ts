import * as s from 'superstruct';
import { emailString } from '../../../lib/validation/struct-helpers';

export const CreateUserBodyStruct = s.type({
  type: s.optional(s.enums(['SELLER', 'BUYER'])),
  name: s.size(s.string(), 2, 10),
  email: emailString,
  password: s.size(s.string(), 8, 20),
});

export const UpdateMeBodyStruct = s.type({
  currentPassword: s.size(s.string(), 8, 20),
  name: s.optional(s.size(s.string(), 2, 10)),
  email: s.optional(emailString),
  password: s.optional(s.size(s.string(), 8, 20)),
});
