import express from 'express';
import type { Express } from 'express';
import cors from 'cors';

import { fakeUsersDb } from 'database.js';
import { health, logIn, register, update, remove } from 'handler.js';

import { afterResponseLogger } from 'middleware/log.js';
import { authVerifier } from 'middleware/auth.js';

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(afterResponseLogger);
app.use(authVerifier);

// Routes
app.get('/users/health', health);

app.get('/users', (req, res) => {
    const users = Object.values(fakeUsersDb);
    res.json(users);
});

app.post('/users/create', register);

app.get('/users/status', (req, res) => {
    res.json({status: 'Users service is running'});
});

app.get('/users/login/:userId', logIn);

app.put('/users/update/:userId', update);

app.delete('/users/remove/:userId', remove);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Users service running on port ${PORT}`);
});
