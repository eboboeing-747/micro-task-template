import { fakeUsersDb } from 'database.js';
import { type UserRegister, type User, type UserReturn, type UserPayload, type UserAuth } from 'user.js';
import type { Request, Response } from 'express';
import { generateToken } from 'auth.js';

export function extractUserId(req: Request): number | null {
    const userId: number | typeof NaN = parseInt(req.params.userId!);
    
    if (Number.isNaN(userId))
        return null

    return userId;
}

export function health(req: Request, res: Response): void {
    res.status(200).json({
        service: 'users',
        timestamp: new Date().toISOString()
    });
}

export function register(req: Request, res: Response): void {
    const userData: UserRegister = req.body as unknown as UserRegister;
    const newUser: User = {
        id: 0,
        ...userData
    };

    const newUserId: number | null = fakeUsersDb.add(newUser);

    if (newUserId === null)
        res.status(409);
    else {
        const userAuth: UserAuth = {
            id: newUserId
        };

        const token: string = generateToken(userAuth);

        res
            .status(201)
            .cookie('auth-token', `Bearer ${token}`)
            .json({
                id: newUserId
            });
    }
}

export function logIn(req: Request, res: Response): void {
    const userId: number | null = extractUserId(req);

    if (userId === null) {
        res.status(400).json({
            error: 'failed to parse userId into int'
        });
        return;
    }

    const user: User | null = fakeUsersDb.get(userId);

    if (user === null) {
        res.status(404).json({
            error: `failed to find user with userId: ${userId}`
        });
        return;
    }

    const userRet: UserReturn = {
        id: user.id,
        login: user.login,
        name: user.name,
        idk: user.idk
    };

    res.status(200).json(userRet);
}

export function update(req: Request, res: Response): void {
    const userId: number | null = extractUserId(req);

    if (userId === null) {
        res.status(400).json({
            error: 'failed to parse userId into int'
        });
        return;
    }

    const userPl: UserPayload = req.body;
    const success: boolean = fakeUsersDb.update(userId, userPl);

    if (!success) {
        res.status(404).json({
            error: `failed to find user with userId: ${userId}`
        });
        return;
    }

    res.status(200);
}

export function remove(req: Request, res: Response): void {
    const userId: number | null = extractUserId(req);

    if (userId === null) {
        res.status(400).json({
            error: 'failed to parse userId into int'
        });
        return;
    }

    fakeUsersDb.remove(userId);
    res.status(200);
}
