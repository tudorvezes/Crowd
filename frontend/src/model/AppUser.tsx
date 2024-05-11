import * as React from "react";

export type User = {
    username: string;
    token: string;
}

export type UserProfile = {
    username: string;
}

export type UserLogin = {
    username: string;
    password: string;
}

export type UserRegister = {
    username: string;
    email: string;
    phoneNumber: string;
    password: string;
}