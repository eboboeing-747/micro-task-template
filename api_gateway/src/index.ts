import dotenv from 'dotenv';
import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import axios, { type AxiosResponse } from 'axios';
import CircuitBreaker from 'opossum';

import { authVerifier } from './middleware/auth.js';
import { addAuthCookie } from './auth.js';

import type { UserAuth, User, UserReturn } from '@local/types';
import type { Order } from '@local/types';
import type { Error } from '@local/types';

dotenv.config({});

interface UserResponse {
    body: UserAuth | User | User[] | UserReturn | Error,
    status: number
}

interface OrderResponse {
    body: Order[] | Order | Error,
    status: number
}

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(authVerifier);

// Service URLs
const USERS_SERVICE_URL: string = process.env.USERS_SERVICE_URL || 'http://service_users:8001';
const ORDERS_SERVICE_URL: string = process.env.ORDERS_SERVICE_URL || 'http://service_orders:8002';

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
            validateStatus: status => (status >= 200 && status < 300) || (status >= 400 && status < 500)
        });

        return {
            body: response.data,
            status: response.status
        } as UserResponse;
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

        return {
            body: response.data,
            status: response.status
        } as OrderResponse;
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



// log in
// TODO: revert to /users/:userId
app.get('/users/login/:userId', async (req, res) => {
    try {
        const userAuth: UserAuth = {
            id: parseInt(req.params.userId as string)
        } as const;

        const serviceRes: UserResponse = await usersCircuit.fire(
            `${USERS_SERVICE_URL}/users/${userAuth.id}`
        ) as UserResponse;

        if (serviceRes.status === 200)
            addAuthCookie(res, userAuth);

        res.status(serviceRes.status).json(serviceRes.body);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

// register
app.post('/users', async (req, res) => {
    try {
        const serviceRes: UserResponse = await usersCircuit.fire(`${USERS_SERVICE_URL}/users`, {
            method: 'POST',
            data: req.body
        }) as UserResponse;

        switch (serviceRes.status) {
            case 201:
                addAuthCookie(res, serviceRes.body as UserAuth);
                break;
            case 409:
                res.status(serviceRes.status).json({
                    error: `login '${req.body.login}' is taken`
                } as Error);
                return;
        }

        res.status(serviceRes.status).json(serviceRes.body);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

// get all
app.get('/users', async (req, res) => {
    try {
        const serviceRes: UserResponse = await usersCircuit.fire(
            `${USERS_SERVICE_URL}/users`
        ) as UserResponse;

        res.json(serviceRes.body);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

// delete
// was '/users/:userId'
app.delete('/users', async (req, res) => {
    try {
        const userAuth: UserAuth | null = req.carry;

        if (userAuth === null) {
            res.status(403).json({ error: 'no auth token' } as Error);
            return;
        }

        const serviceRes: UserResponse = await usersCircuit.fire(
            `${USERS_SERVICE_URL}/users/${userAuth.id}`,
            { method: 'DELETE' }
        ) as UserResponse;

        res.status(serviceRes.status).json(serviceRes.body);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

// update
// was '/users/:userId'
app.put('/users', async (req, res) => {
    try {
        const userAuth: UserAuth | null = req.carry;

        if (userAuth === null) {
            res.status(403).json({ error: 'no auth token' } as Error);
            return;
        }

        const serviceRes: UserResponse = await usersCircuit.fire(
            `${USERS_SERVICE_URL}/users/${userAuth.id}`,
            {
                method: 'PUT',
                data: req.body
            }
        ) as UserResponse;

        res.status(serviceRes.status).json(serviceRes.body);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});



// get order by id
app.get('/orders/:orderId', async (req: Request, res: Response) => {
    try {
        const userAuth: UserAuth | null = req.carry;

        if (userAuth === null) {
            res.status(403).json({ error: 'no auth token' } as Error);
            return;
        }

        const serviceRes: UserResponse = await ordersCircuit.fire(
            `${ORDERS_SERVICE_URL}/orders/${userAuth.id}/${req.params.orderId}`
        ) as UserResponse;

        res.status(serviceRes.status).json(serviceRes.body);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

// create order for user with userId
// req.body is OrderPayload
app.post('/orders', async (req, res) => {
    try {
        const userAuth: UserAuth | null = req.carry;

        if (userAuth === null) {
            res.status(403).json({ error: 'no auth token' } as Error);
            return;
        }

        req.body.userId = userAuth.id;
        const serviceRes: OrderResponse = await ordersCircuit.fire(`${ORDERS_SERVICE_URL}/orders`, {
            method: 'POST',
            data: req.body
        }) as OrderResponse;

        res.status(serviceRes.status).json(serviceRes.body);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

// get all
app.get('/orders', async (req, res) => {
    try {
        const serviceRes = await ordersCircuit.fire(`${ORDERS_SERVICE_URL}/orders`);
        res.json(serviceRes);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.delete('/orders/:orderId', async (req, res) => {
    try {
        const userAuth: UserAuth | null = req.carry;

        if (userAuth === null) {
            res.status(403).json({ error: 'no auth token' } as Error);
            return;
        }

        const serviceRes: OrderResponse = await ordersCircuit.fire(
            `${ORDERS_SERVICE_URL}/orders/${req.params.orderId}`,
            { method: 'DELETE' }
        ) as OrderResponse;

        res.status(serviceRes.status).json(serviceRes.body);
    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

app.put('/orders/:orderId', async (req, res) => {
    try {
        const userAuth: UserAuth | null = req.carry;

        if (userAuth === null) {
            res.status(403).json({ error: 'no auth token' } as Error);
            return;
        }

        const serviceRes: OrderResponse = await ordersCircuit.fire(
            `${ORDERS_SERVICE_URL}/orders/${req.params.orderId}`,
            {
                method: 'PUT',
                data: req.body
            }
        ) as OrderResponse;

        res.status(serviceRes.status).json(serviceRes.body);
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
app.get('/users/details', async (req, res) => {
    try {
        const userAuth: UserAuth | null = req.carry;

        if (userAuth === null) {
            res.status(403).json({ error: 'no auth token' } as Error);
            return;
        }

        // get user
        const userPromise: Promise<UserResponse> = usersCircuit.fire(
            `${USERS_SERVICE_URL}/users/${userAuth.id}`
        ) as Promise<UserResponse>;

        // get user's orders (assuming orders have a userId field)
        const ordersPromise: Promise<OrderResponse> = ordersCircuit.fire(
            `${ORDERS_SERVICE_URL}/orders?userId=${userAuth.id}`
        ) as Promise<OrderResponse>;

        const [user, userOrders]: [UserResponse, OrderResponse] = await Promise.all([userPromise, ordersPromise]);

        if (user.status === 404)
            return res.status(user.status).json(user.body);

        // Return aggregated response
        res.json({
            user: user.body,
            orders: userOrders.body
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
