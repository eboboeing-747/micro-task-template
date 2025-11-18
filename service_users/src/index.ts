import dotenv from 'dotenv';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';

import { health, logIn, register, update, remove, getAll } from './handler.js';

import { afterResponseLogger } from './middleware/log.js';
import { authVerifier } from './middleware/auth.js';

dotenv.config({});

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 8000;

app.use(cors());
app.use(express.json());
app.use(afterResponseLogger);
app.use(authVerifier);

app.get('/users/jwtprot', (req, res) => {
    console.log(`[CARRY] ${req.carry}`);

    if (req.carry === null)
        res.status(401);
    else
        res.status(200);

    res.send();
});

app.get('/users/health', health);
app.get('/users', getAll);
app.post('/users/create', register);
app.get('/users/login/:userId', logIn);
app.put('/users/update/:userId', update);
app.delete('/users/remove/:userId', remove);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Users service running on port ${PORT}`);
});
