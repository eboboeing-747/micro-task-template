import { type User, type UserPayload, type UserRegister } from 'user.js';

export class Database {
    private table: User[] = [];
    private currentId: number = 0;

    public getAll(): User[] {
        return this.table;
    }

    public add(user: User): number | null {
        if (this.exists(user.login))
            return null;

        this.currentId++;
        user.id = this.currentId;
        this.table.push(user);

        return user.id;
    }

    public exists(login: string): boolean {
        return this.table.some(
            (user: User): boolean => login === user.login
        );
    }

    public get(id: number): User | null {
        const user: User | undefined = this.table.find(
            (u: User): boolean => id === u.id
        );

        return user ?? null;
    }

    public update(userId: number, userPl: UserPayload): boolean {
        const user: User | null = this.get(userId);

        if (user === null)
            return false;

        if (userPl.name)
            user.name = userPl.name;
        if (userPl.idk)
            user.idk = userPl.idk;

        return true;
    }

    public remove(userId: number): boolean {
        const index: number = this.table.findIndex((user: User): boolean => user.id == userId);

        if (index === -1)
            return false;

        delete this.table[index];
        return true;
    }
}

// Имитация базы данных в памяти (LocalStorage)
export const fakeUsersDb: Database = new Database();
