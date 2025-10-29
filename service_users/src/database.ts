import { type User, type UserRegister } from 'user.ts';

export class Database {
    private table: User[] = [];
    private currentId: number = 0;

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
}

// Имитация базы данных в памяти (LocalStorage)
export const fakeUsersDb: Database = new Database();
