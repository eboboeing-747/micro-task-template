interface Record {
    id: number;
}

export class Database<T extends Record> {
    private table: T[] = [];
    private currentId: number = 0;

    public getAll(): T[] {
        return this.table;
    }

    public add(record: T, isValidCallback: (arg0: T, table: T[]) => boolean): number | null {
        if (!isValidCallback(record, this.table))
            return null;

        this.currentId++;
        record.id = this.currentId;
        this.table.push(record);

        return record.id;
    }

    public exists(existsCallback: (record: T) => boolean): boolean {
        return this.table.some(
            (record: T): boolean => existsCallback(record)
        );
    }

    public get(id: number): T | null {
        const record: T | undefined = this.table.find(
            (r: T): boolean => id === r.id
        );

        return record ?? null;
    }

    public update(recordId: number, newRecord: T, updateCallback: (old: T, curr: T) => void): boolean {
        const record: T | null = this.get(recordId);

        if (record === null)
            return false;

        updateCallback(record, newRecord);

        return true;
    }

    public remove(recordId: number): boolean {
        const index: number = this.table.findIndex((record: T): boolean => record.id == recordId);

        if (index === -1)
            return false;

        delete this.table[index];
        return true;
    }
}
