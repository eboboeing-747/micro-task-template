import type { Request, Response, NextFunction } from "express";

import { fakeUsersDb } from "../database.js";

export function afterResponseLogger(req: Request, res: Response, next: NextFunction): void {
    next();

    console.log(fakeUsersDb.getAll());
}
