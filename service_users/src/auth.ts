import jwt, { type JwtPayload, type Secret, type VerifyErrors, type VerifyOptions } from 'jsonwebtoken';
import { type UserAuth } from 'user.js'

export const AUTH_TOKEN_NAME: string = process.env.AUTH_TOKEN_NAME || 'auth-token';
const SECRET_AUTH_KEY: Secret = process.env.SECRET_AUTH_KEY || 'lmao';
const JWT_SIGN_OPTIONS: jwt.SignOptions = {
    algorithm: 'HS256'
} as const;

export function generateToken(user: UserAuth): string {
    return jwt.sign(user, SECRET_AUTH_KEY, JWT_SIGN_OPTIONS);
}

export function verifyToken(token: string): UserAuth | null {
    let userAuth: UserAuth | null = null;

    jwt.verify(
        token,
        SECRET_AUTH_KEY,
        (err: VerifyErrors | null, decoded: JwtPayload | string | undefined): void => {
            if (err === null || decoded === undefined) {
                userAuth = null;
                return;
            }

            userAuth = decoded as UserAuth;
        });

    return userAuth;
}
