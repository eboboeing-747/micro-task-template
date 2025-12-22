let USERS_SERVICE_DOMAIN: string | undefined;
let ORDERS_SERVICE_DOMAIN: string | undefined;
const USERS_SERVICE_PORT: string = process.env.USERS_SERVICE_PORT || '8000';
const ORDERS_SERVICE_PORT: string = process.env.ORDERS_SERVICE_PORT || '8000';

function readConfiguration(): void {
    if (process.env.NODE_ENV !== 'production') {
        USERS_SERVICE_DOMAIN = 'localhost';
        ORDERS_SERVICE_DOMAIN = 'localhost';
        return;
    }

    USERS_SERVICE_DOMAIN = process.env.USERS_SERVICE_DOMAIN;
    ORDERS_SERVICE_DOMAIN = process.env.ORDERS_SERVICE_DOMAIN;

    if (!(USERS_SERVICE_DOMAIN && ORDERS_SERVICE_DOMAIN))
        console.log(`\x1b[33m[WARNING] FAILED TO READ .env`);
}

readConfiguration();

export const USERS_SERVICE_URL: string = `http://${USERS_SERVICE_DOMAIN}:${USERS_SERVICE_PORT}`;
export const ORDERS_SERVICE_URL: string = `http://${ORDERS_SERVICE_DOMAIN}:${ORDERS_SERVICE_PORT}`;
