import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { health, getOrder, get, createOrder, updateOrder, deleteOrder } from './handler.js';

dotenv.config({});

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json());

app.get('/orders/health', health);
app.get('/orders/:orderId', getOrder);
app.get('/orders', get);
app.post('/orders', createOrder);
app.put('/orders/:orderId', updateOrder);
app.delete('/orders/:orderId', deleteOrder);

app.listen(PORT, () => {
    console.log(`Orders service running on port ${PORT}`);
});
