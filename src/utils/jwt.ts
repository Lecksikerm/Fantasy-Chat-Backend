import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

const accessSecret = process.env.JWT_ACCESS_SECRET as string;
const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

const accessOpts: SignOptions = {
  expiresIn: (process.env.JWT_ACCESS_SECRET_EXPIRY  || '1d') as any
};
const refreshOpts: SignOptions = {
  expiresIn: (process.env.JWT_REFRESH_SECRET_EXPIRY || '7d') as any
};

export const signAccessToken = (userId: string | Types.ObjectId): string =>
  jwt.sign({ userId: userId.toString() }, accessSecret, accessOpts);

export const signRefreshToken = (userId: string | Types.ObjectId): string =>
  jwt.sign({ userId: userId.toString() }, refreshSecret, refreshOpts);


