import type { Request, Response } from "express";

let fakeOrdersDb: any = {};
let currentId: any = 1;

export function health(req: Request, res: Response): void {
    res.json({
        status: 'OK',
        service: 'Orders Service',
        timestamp: new Date().toISOString()
    })
}

export function getOrder(req: Request, res: Response): void {
    const orderId: number = parseInt(req.params.orderId!);
    const order = fakeOrdersDb[orderId];

    if (!order) {
        res.status(404).json({error: 'Order not found'});
    }

    res.json(order);
}

export function getAll(req: Request, res: Response): void {
    let orders = Object.values(fakeOrdersDb);

    // Добавляем фильтрацию по userId если передан параметр
    if (req.query.userId) {
        const userId: number = parseInt(req.query.userId as string);
        orders = orders.filter((order: any) => order.userId === userId);
    }

    res.json(orders);
}

export function createOrder(req: Request, res: Response): void {
    const orderData = req.body;
    const orderId = currentId++;

    const newOrder = {
        id: orderId,
        ...orderData
    };

    fakeOrdersDb[orderId] = newOrder;
    res.status(201).json(newOrder);
}

export function updateOrder(req: Request, res: Response): void {
    const orderId: number = parseInt(req.params.orderId as string);
    const orderData = req.body;

    if (!fakeOrdersDb[orderId]) {
        res.status(404).json({error: 'Order not found'});
    }

    fakeOrdersDb[orderId] = {
        id: orderId,
        ...orderData
    };

    res.json(fakeOrdersDb[orderId]);
}

export function deleteOrder(req: Request, res: Response): void {
    const orderId: number = parseInt(req.params.orderId!);

    if (!fakeOrdersDb[orderId]) {
        res.status(404).json({error: 'Order not found'});
    }

    const deletedOrder = fakeOrdersDb[orderId];
    delete fakeOrdersDb[orderId];

    res.json({message: 'Order deleted', deletedOrder});
}
