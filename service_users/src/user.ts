export interface UserCredentials {
    login: string;
    password: string;
}

export interface User extends UserCredentials {
    id: number;
}

export interface UserRegister extends UserCredentials {
}
