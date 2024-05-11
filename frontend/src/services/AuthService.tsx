import * as React from "react";
import axios from "axios";
import {User, UserLogin, UserRegister} from "../model/AppUser";
import {handleError} from "./ErrorHandler";

const api  = "https://localhost:7121/api/";

export const loginAPI = async (username: string, password: string) => {
    try {
        const user: UserLogin = {
            username: username,
            password: password,
        };

        const data = await axios.post<User>(api + "account/login", user);
        return data;
    } catch (error) {
        console.log(error);
        handleError(error);
    }
};

export const registerAPI = async (username: string, email: string, phoneNumber: string, password: string) => {
    try {
        const user: UserRegister = {
            username: username,
            email: email,
            phoneNumber: phoneNumber,
            password: password,
        };

        const data = await axios.post<User>(api + "account/register", user);
        return data;
    } catch (error) {
        console.log(error);
        handleError(error);
    }
};