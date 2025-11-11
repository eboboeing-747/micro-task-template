import { generateToken, verifyToken } from 'auth.js';
import type { Request, Response, NextFunction } from 'express';
import type { UserAuth } from 'user.js';
import { AUTH_TOKEN_NAME } from 'auth.js';

function extractToken(tokenHeader: string): string | null {
    const index: number = tokenHeader.indexOf(' ');

    if (index === -1)
        return null;

    return tokenHeader.substring(index + 1);
}

export function authVerifier(req: Request, res: Response, next: NextFunction): void {
    const tokenHeader: any = req.headers[AUTH_TOKEN_NAME];

    if (!tokenHeader) {
        res.status(400).json({
            error: `no ${AUTH_TOKEN_NAME} in headers`
        });
        return;
    }

    const token: string | null = extractToken(tokenHeader);

    if (!token) {
        res.status(400).json({
            error: `failed to find ${AUTH_TOKEN_NAME}`
        });
        return;
    }

    const userAuth: UserAuth | null = verifyToken(token);
    req.carry = userAuth;
    
    next();
}
