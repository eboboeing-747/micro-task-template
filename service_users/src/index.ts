import dotenv from 'dotenv';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';

import { health, logIn, register, update, remove, getAll } from './handler.js';

import { afterResponseLogger } from './middleware/log.js';

dotenv.config({});

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json());
app.use(afterResponseLogger);

app.get('/users/health', health);
app.get('/users', getAll);
app.post('/users', register);
app.get('/users/:userId', logIn);
app.put('/users/:userId', update);
app.delete('/users/:userId', remove);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Users service running on port ${PORT}`);
});
