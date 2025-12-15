import type { Request, Response } from 'express';

import { fakeUsersDb, isValid, updateUser } from './database.js';
import type { UserRegister, User, UserReturn, UserAuth } from '@local/types';
import type { Error } from '@local/types';

export function extractUserId(req: Request): number | null {
    const userId: number | typeof NaN = parseInt(req.params.userId!);
    
    if (Number.isNaN(userId))
        return null

    return userId;
}

export function health(req: Request, res: Response): void {
    res.status(200).json({
        status: 'Users service is running',
        service: 'users',
        timestamp: new Date().toISOString()
    });
}

export function getAll(req: Request, res: Response): void {
    const table: User[] = fakeUsersDb.getAll();
    res.json(table);
}

export function register(req: Request, res: Response): void {
    const userData: UserRegister = req.body as unknown as UserRegister;
    const newUser: User = {
        id: 0,
        ...userData
    };

    const newUserId: number | null = fakeUsersDb.add(newUser, isValid);

    if (newUserId === null)
        res.status(409).send();
    else {
        const userAuth: UserAuth = {
            id: newUserId
        };

        res.status(201).json(userAuth);
    }
}

export function logIn(req: Request, res: Response): void {
    const userId: number | null = extractUserId(req);

    if (userId === null) {
        res.status(400).json({
            error: 'failed to parse userId into int'
        } as Error);

        return;
    }

    const user: User | null = fakeUsersDb.get(userId);

    if (user === null) {
        res.status(404).json({
            error: `failed to find user with userId: ${userId}`
        } as Error);

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
        } as Error);

        return;
    }

    const userPayload: User = req.body;
    const success: boolean = fakeUsersDb.update(userId, userPayload, updateUser);

    if (!success) {
        res.status(404).json({
            error: `failed to find user with userId: ${userId}`
        } as Error);

        return;
    }

    res.status(200).send();
}

export function remove(req: Request, res: Response): void {
    const userId: number | null = extractUserId(req);

    if (userId === null) {
        res.status(400).json({
            error: 'failed to parse userId into int'
        } as Error);

        return;
    }

    fakeUsersDb.remove(userId);
    res.status(200);
}
