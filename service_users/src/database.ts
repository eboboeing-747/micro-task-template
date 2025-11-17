import { Database } from "@local/database";
import type { User } from "user.js";

export function isValid(newUser: User, table: User[]): boolean {
    return !table.some(user => user.login === newUser.login);
}

export function updateUser(oldUser: User, newUser: User): void {
    if (newUser.name)
        oldUser.name = newUser.name;
    if (newUser.idk)
        oldUser.idk = newUser.idk;
}

export const fakeUsersDb: Database<User> = new Database<User>();
