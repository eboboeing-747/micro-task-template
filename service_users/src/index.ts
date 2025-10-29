import express from 'express';
import cors from 'cors';

const app = express();
const PORT: number = Number(process.env.PORT) || 8000;


// Middleware
// app.use(cors());
app.use(express.json());

// Имитация базы данных в памяти (LocalStorage)
let fakeUsersDb = {};
let currentId = 1;

app.get('/users/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Users Service',
        timestamp: new Date().toISOString()
    });
})

app.options('/lmao', (req, res) => {
    res.send('bruh');
})

// Routes
app.get('/users', (req, res) => {
    const users = Object.values(fakeUsersDb);
    res.json(users);
});

// Start server
app.listen(PORT, () => {
    console.log(`Users service running on port ${PORT}`);
});
