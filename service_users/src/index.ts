import express from 'express';
import type { Express } from 'express';
import cors from 'cors';

import { fakeUsersDb } from 'database.ts';
import { health, register } from 'handler.ts';

const app: Express = express();
const PORT = Number(process.env.PORT) || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/users/health', health);

app.get('/users', (req, res) => {
    const users = Object.values(fakeUsersDb);
    res.json(users);
});

// was '/users'
app.post('/users/create', register);

app.get('/users/status', (req, res) => {
    res.json({status: 'Users service is running'});
});

app.get('/users/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = fakeUsersDb[userId];

    if (!user) {
        return res.status(404).json({error: 'User not found'});
    }

    res.json(user);
});

app.put('/users/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const updates = req.body;

    if (!fakeUsersDb[userId]) {
        return res.status(404).json({error: 'User not found'});
    }

    const updatedUser = {
        ...fakeUsersDb[userId],
        ...updates
    };

    fakeUsersDb[userId] = updatedUser;
    res.json(updatedUser);
});

app.delete('/users/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);

    if (!fakeUsersDb[userId]) {
        return res.status(404).json({error: 'User not found'});
    }

    const deletedUser = fakeUsersDb[userId];
    delete fakeUsersDb[userId];

    res.json({message: 'User deleted', deletedUser});
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Users service running on port ${PORT}`);
});
