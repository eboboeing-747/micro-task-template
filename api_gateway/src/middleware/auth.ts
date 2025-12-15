import type { Request, Response, NextFunction } from 'express';

import { verifyToken, AUTH_TOKEN_NAME } from '../auth.js';
import type { UserAuth } from '@local/types';

function extractToken(tokenHeader: string): string | null {
    const index: number = tokenHeader.indexOf(' ');

    if (index === -1)
        return null;

    return tokenHeader.substring(index + 1);
}

export function authVerifier(req: Request, res: Response, next: NextFunction): void {
    let userAuth: UserAuth | null = null;
    const tokenHeader: any = req.headers[AUTH_TOKEN_NAME];

    if (tokenHeader) {
        const token: string | null = extractToken(tokenHeader);

        if (token)
            userAuth = verifyToken(token);
    }

    req.carry = userAuth;
    next();
}
