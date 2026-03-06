import * as s from 'superstruct';
import { emailString } from '../../../lib/validation/struct-helpers';

export const LoginBodyStruct = s.type({
  email: emailString,
  password: s.size(s.string(), 8, 20),
});
