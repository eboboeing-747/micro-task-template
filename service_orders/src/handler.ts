import type { Request, Response } from "express";
import { exists, fakeOrdersDb, isValid, update } from "./database.js";
import type { Order } from "@local/types";
import type { Error } from "@local/types";

export function health(req: Request, res: Response): void {
    res.json({
        status: 'OK',
        service: 'Orders Service',
        timestamp: new Date().toISOString()
    })
}

export function getOrder(req: Request, res: Response): void {
    const orderId: number = parseInt(req.params.orderId as string);
    const order: Order | null = fakeOrdersDb.get(orderId);

    if (!order) {
        res.status(404).json({error: 'Order not found'} as Error);
        return;
    }

    res.json(order);
}

export function get(req: Request, res: Response): void {
    let orders: Order[] = fakeOrdersDb.getAll();

    // Добавляем фильтрацию по userId если передан параметр
    if (req.query.userId) {
        const userId: number = parseInt(req.query.userId as string);
        orders = orders.filter((order: Order) => order.userId === userId);
    }

    res.status(200).json(orders);
}

export function createOrder(req: Request, res: Response): void {
    const orderData = req.body;

    const newOrder = {
        id: 0,
        ...orderData
    };

    fakeOrdersDb.add(newOrder, isValid);
    res.status(201).json(newOrder);
}

export function updateOrder(req: Request, res: Response): void {
    const orderId: number = parseInt(req.params.orderId as string);
    const orderData = req.body;

    const newOrder: Order = {
        id: orderId,
        ...orderData
    };

    if (!fakeOrdersDb.exists(newOrder, exists)) {
        res.status(404).json({error: 'Order not found'} as Error);
    }

    fakeOrdersDb.update(orderId, newOrder, update);

    res.json(fakeOrdersDb.get(orderId));
}

export function deleteOrder(req: Request, res: Response): void {
    const orderId: number = parseInt(req.params.orderId!);

    const newOrder: Order = {
        id: orderId,
        userId: 0
    };

    if (!fakeOrdersDb.exists(newOrder, exists)) {
        res.status(404).json({error: 'Order not found'} as Error);
    }

    const deletedOrder = fakeOrdersDb.get(orderId);
    fakeOrdersDb.remove(orderId);

    res.json({message: 'Order deleted', deletedOrder});
}
