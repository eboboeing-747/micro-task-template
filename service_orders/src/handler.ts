import type { Request, Response } from "express";
import { exists, fakeOrdersDb, isValid, update } from "./database.js";

import type { Order, OrderCreate } from "@local/types";
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

    const userId: number = parseInt(req.params.userId as string);

    if (order.userId !== userId) {
        res.status(403).send();
        return;
    }

    res.json(order);
}

export function getAllOfUser(req: Request, res: Response): void {
    let orders: Order[] = fakeOrdersDb.getAll();

    // Добавляем фильтрацию по userId если передан параметр
    if (req.query.userId) {
        const userId: number = parseInt(req.query.userId as string);
        orders = orders.filter((order: Order) => order.userId === userId);
    }

    res.status(200).json(orders);
}

export function createOrder(req: Request, res: Response): void {
    const orderData: OrderCreate = req.body;
    const newOrder: Order = {
        id: 0,
        userId: orderData.userId,
        entries: orderData.entries
    };

    const newOrderId: number | null = fakeOrdersDb.add(newOrder, isValid);
    res.status(201).json(newOrderId);
}

export function updateOrder(req: Request, res: Response): void {
    const orderId: number = parseInt(req.params.orderId as string);
    const orderData = req.body;
    const newOrder: Order = {
        id: orderId,
        ...orderData
    };
    const currentOrder: Order | null = fakeOrdersDb.get(orderId);

    if (!currentOrder) {
        res.status(404).json({error: 'Order not found'} as Error);
        return;
    }

    const userId: number = parseInt(req.params.userId as string);

    if (currentOrder.userId !== userId) {
        res.status(403).send();
        return;
    }

    fakeOrdersDb.update(orderId, newOrder, update);
    res.json(fakeOrdersDb.get(orderId));
}

export function deleteOrder(req: Request, res: Response): void {
    const orderId: number = parseInt(req.params.orderId as string);
    const currentOrder: Order | null = fakeOrdersDb.get(orderId);

    if (!currentOrder) {
        res.status(404).json({error: 'Order not found'} as Error);
        return;
    }

    const userId: number = parseInt(req.params.userId as string);

    if (currentOrder.userId !== userId) {
        res.status(403).send();
        return;
    }

    const deletedOrder = fakeOrdersDb.get(orderId);
    fakeOrdersDb.remove(orderId);

    res.json({message: 'Order deleted', deletedOrder});
}
