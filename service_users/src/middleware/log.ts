import { fakeUsersDb } from "database.js";
import type { Request, Response, NextFunction } from "express";

export function afterResponseLogger(req: Request, res: Response, next: NextFunction): void {
    next();

    console.log(fakeUsersDb.getAll());
}

// export function applyServerHardening(app: Express): void {
//   app.disable('x-powered-by');
//   // Make your Express app use your custom middleware:
//   app.use(preventCrossSiteScripting);
// }
