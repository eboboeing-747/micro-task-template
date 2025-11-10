export interface UserPayload {
    name: string;
    idk: string;
}

export interface UserCredentials extends UserPayload {
    login: string;
    password: string;
}

export interface User extends UserPayload {
    id: number;
    login: string;
    password: string;
}

export interface UserRegister extends UserCredentials, UserPayload {
}

export interface UserReturn extends UserPayload {
    id: number;
    login: string;
}
