import * as s from 'superstruct';
import { emailString } from '../../../lib/validation/struct-helpers';

export const CreateUserBodyStruct = s.type({
  type: s.optional(s.enums(['SELLER', 'BUYER'])),
  name: s.size(s.string(), 2, Infinity),
  email: emailString,
  password: s.size(s.string(), 8, Infinity),
});

export const UpdateMeBodyStruct = s.type({
  currentPassword: s.size(s.string(), 8, Infinity),
  name: s.optional(s.size(s.string(), 2, Infinity)),
  email: s.optional(emailString),
  password: s.optional(s.size(s.string(), 8, Infinity)),
});
