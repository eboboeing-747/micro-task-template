import { type Response } from 'express';
import dotenv from 'dotenv';
import jwt, { type JwtPayload, type Secret,  } from 'jsonwebtoken';

import { type User, type UserAuth, type UserReturn, } from './user.js'

dotenv.config({});

export const AUTH_TOKEN_NAME: string = process.env.AUTH_TOKEN_NAME || 'auth-token';
const SECRET_AUTH_KEY: Secret = process.env.SECRET_AUTH_KEY || 'NOT_A_SECRET_KEY';

const JWT_SIGN_OPTIONS: jwt.SignOptions = {
    algorithm: 'HS256'
} as const;

export function generateToken(user: UserAuth): string {
    return jwt.sign(user, SECRET_AUTH_KEY, JWT_SIGN_OPTIONS);
}

export function verifyToken(token: string): UserAuth | null {
    let userAuth: UserAuth | string | JwtPayload | null = null;

    try {
        userAuth = jwt.verify(token, SECRET_AUTH_KEY);
    } catch(error) {
        userAuth = null;
    }

    return userAuth as UserAuth | null;
}

export function addAuthCookie(res: Response, user: User | UserReturn | UserAuth): void {
    const userAuth: UserAuth = {
        id: user.id
    };

    const token: string = generateToken(userAuth);
    res.cookie(AUTH_TOKEN_NAME, `Bearer ${token}`);
}
