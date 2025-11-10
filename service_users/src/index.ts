import express from 'express';
import type { Express } from 'express';
import cors from 'cors';

import { fakeUsersDb } from 'database.js';
import { health, logIn, register, update, remove } from 'handler.js';

import { afterResponseLogger } from 'middleware.js';

const app: Express = express();
const PORT = Number(process.env.PORT) || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(afterResponseLogger);



// app.get('/users/health', (req, res) => {
// app.get('/users', (req, res) => {
// app.post('/users', (req, res) => {
// app.get('/users/status', (req, res) => {
// app.get('/users/:userId', (req, res) => {
// app.put('/users/:userId', (req, res) => {
// app.delete('/users/:userId', (req, res) => {



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

app.get('/users/login/:userId', logIn);

app.put('/users/update/:userId', update);

app.delete('/users/remove/:userId', remove);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Users service running on port ${PORT}`);
});
