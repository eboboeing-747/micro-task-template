export interface OrderPayload {
    entries: number[];
}

export interface OrderCreate {
    userId: number;
    entries: number[];
}

export interface Order {
    id: number;
    userId: number;
    entries: number[];
}
