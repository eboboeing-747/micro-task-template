import { Database } from "@local/database";
import type { Order } from "@local/types";

export function isValid(order: Order): boolean {
    return true;
}

export function exists(oldOrder: Order, newOrder: Order): boolean {
    return oldOrder.id === newOrder.id;
}

export function update(oldOrder: Order, newOrder: Order): void {
    if (newOrder.entries)
        oldOrder.entries = newOrder.entries;
}

export const fakeOrdersDb: Database<Order> = new Database<Order>();
