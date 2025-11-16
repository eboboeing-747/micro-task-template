import { Database } from "./database.js";

interface User {
    id: number;
    login: string;
    idk: any;
    rest: any;
}

const fakeUsersDb: Database<User> = new Database<User>();

const user1: User = {
    id: 1234123,
    login: 'lmao',
    idk: 'lmao',
    rest: 'bruh'
};

function isUnique(user: User, table: User[]): boolean {
    return !table.some(u => u.login === user.login);
}

const user1Id: number | null = fakeUsersDb.add(user1, isUnique);

console.log(fakeUsersDb.getAll());

function update(userToUpdate: User, userUpdate: User): void {
    if (userUpdate.idk)
        userToUpdate.idk = userUpdate.idk;
    if (userUpdate.rest)
        userToUpdate.rest = userUpdate.rest;
}

const newUser: User = {
    id: 452839457,
    login: 'lmao',
    idk: 'newlmaoupdated',
    rest: 'newbruhupdated'
}

fakeUsersDb.update(user1Id!, newUser, update);

console.log(fakeUsersDb.getAll());
