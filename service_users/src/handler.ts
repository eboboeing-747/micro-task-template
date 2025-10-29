import { fakeUsersDb } from 'database.ts';
import express from 'express';
import { type UserRegister, type User } from 'user.ts';
import type { Request, Response } from 'express';

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
    else
        res.status(201).json({
            id: newUserId
        });
}
