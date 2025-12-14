import dotenv from 'dotenv';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import axios, { type AxiosResponse } from 'axios';
import CircuitBreaker from 'opossum';
import type { PrivateKey } from 'jsonwebtoken';

dotenv.config({});

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Service URLs
const USERS_SERVICE_URL: string = 'http://service_users:8001';
const ORDERS_SERVICE_URL: string = 'http://service_orders:8002';

// Circuit Breaker configuration
const circuitOptions = {
    timeout: 3000, // Timeout for requests (3 seconds)
    errorThresholdPercentage: 50, // Open circuit after 50% of requests fail
    resetTimeout: 3000, // Wait 30 seconds before trying to close the circuit
};

// Create circuit breakers for each service
const usersCircuit: CircuitBreaker = new CircuitBreaker(async (url, options = {}) => {
    try {
        const response: AxiosResponse = await axios({
            url,
            ...options as any,
            validateStatus: status => (status >= 200 && status < 300) || status === 404
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return error.response.data;
        }
        throw error;
    }
}, circuitOptions);

const ordersCircuit: CircuitBreaker = new CircuitBreaker(async (url, options = {}) => {
    try {
        const response: AxiosResponse = await axios({
            url,
            ...options as any,
            validateStatus: status => (status >= 200 && status < 300) || status === 404
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return error.response.data;
        }
        throw error;
    }
}, circuitOptions);

// Fallback functions
usersCircuit.fallback(() => ({error: 'Users service temporarily unavailable'}));
ordersCircuit.fallback(() => ({error: 'Orders service temporarily unavailable'}));

// Routes with Circuit Breaker
app.get('/users/:userId', async (req, res) => {
    try {
        const user: any = await usersCircuit.fire(`${USERS_SERVICE_URL}/users/${req.params.userId}`);

        if (user.status === 404) {
            res.status(404).json(user.body.error);
        } else {
            res.json(user);
        }
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.post('/users', async (req, res) => {
    try {
        const user = await usersCircuit.fire(`${USERS_SERVICE_URL}/users`, {
            method: 'POST',
            data: req.body
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await usersCircuit.fire(`${USERS_SERVICE_URL}/users`);
        res.json(users);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.delete('/users/:userId', async (req, res) => {
    try {
        const result = await usersCircuit.fire(`${USERS_SERVICE_URL}/users/${req.params.userId}`, {
            method: 'DELETE'
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.put('/users/:userId', async (req, res) => {
    try {
        const user = await usersCircuit.fire(`${USERS_SERVICE_URL}/users/${req.params.userId}`, {
            method: 'PUT',
            data: req.body
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});



app.get('/orders/:orderId', async (req, res) => {
    try {
        const order: any = await ordersCircuit.fire(`${ORDERS_SERVICE_URL}/orders/${req.params.orderId}`);

        if (order.status === 404) {
            res.status(404).json(order.body.error);
        } else {
            res.json(order);
        }
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.post('/orders', async (req, res) => {
    try {
        const order = await ordersCircuit.fire(`${ORDERS_SERVICE_URL}/orders`, {
            method: 'POST',
            data: req.body
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.get('/orders', async (req, res) => {
    try {
        const orders = await ordersCircuit.fire(`${ORDERS_SERVICE_URL}/orders`);
        res.json(orders);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.delete('/orders/:orderId', async (req, res) => {
    try {
        const result = await ordersCircuit.fire(`${ORDERS_SERVICE_URL}/orders/${req.params.orderId}`, {
            method: 'DELETE'
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.put('/orders/:orderId', async (req, res) => {
    try {
        const order = await ordersCircuit.fire(`${ORDERS_SERVICE_URL}/orders/${req.params.orderId}`, {
            method: 'PUT',
            data: req.body
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.get('/orders/status', async (req, res) => {
    try {
        const status = await ordersCircuit.fire(`${ORDERS_SERVICE_URL}/orders/status`);
        res.json(status);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.get('/orders/health', async (req, res) => {
    try {
        const health = await ordersCircuit.fire(`${ORDERS_SERVICE_URL}/orders/health`);
        res.json(health);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

// Gateway Aggregation: Get user details with their orders
app.get('/users/:userId/details', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Get user details
        const userPromise: Promise<any> = usersCircuit.fire(`${USERS_SERVICE_URL}/users/${userId}`);

        // Get user's orders (assuming orders have a userId field)
        const ordersPromise: Promise<any> = ordersCircuit
            .fire(`${ORDERS_SERVICE_URL}/orders`)
            .then((orders: any) =>
                  orders.filter((order: any) => order.userId == userId)
            );

        // Wait for both requests to complete
        const [user, userOrders] = await Promise.all([userPromise, ordersPromise]);

        // If user not found, return 404
        if (user.error === 'User not found') {
            return res.status(404).json(user);
        }

        // Return aggregated response
        res.json({
            user,
            orders: userOrders
        });
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

// Health check endpoint that shows circuit breaker status
app.get('/health', (req, res) => {
    res.json({
        status: 'API Gateway is running',
        circuits: {
            users: {
                status: usersCircuit.status,
                stats: usersCircuit.stats
            },
            orders: {
                status: ordersCircuit.status,
                stats: ordersCircuit.stats
            }
        }
    });
});

app.get('/status', (req, res) => {
    res.json({status: 'API Gateway is running'});
});

// Start server
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);

    // Log circuit breaker events for monitoring
    usersCircuit.on('open', () => console.log('Users circuit breaker opened'));
    usersCircuit.on('close', () => console.log('Users circuit breaker closed'));
    usersCircuit.on('halfOpen', () => console.log('Users circuit breaker half-open'));

    ordersCircuit.on('open', () => console.log('Orders circuit breaker opened'));
    ordersCircuit.on('close', () => console.log('Orders circuit breaker closed'));
    ordersCircuit.on('halfOpen', () => console.log('Orders circuit breaker half-open'));
});
