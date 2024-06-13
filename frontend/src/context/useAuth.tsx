import * as React from 'react';
import {UserProfile} from "../model/AppUser";
import {createContext, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {loginAPI, registerAPI} from "../services/AuthService";
import {toast} from "react-toastify";
import axios from "axios";

type UseContextType = {
    user: UserProfile | null;
    token: string | null;
    registerUser: (username: string, email: string, phoneNumber: string, password: string) => void;
    loginUser: (username: string, password: string) => void;
    logoutUser: () => void;
    isLoggedIn: () => boolean;
}

type Props = {
    children: React.ReactNode
};

const UserContext = createContext<UseContextType>({} as UseContextType);

export const UserProvider = ({ children }: Props) => {
    const navigate = useNavigate();
    const [token, setToken] = React.useState<string | null>(null);
    const [user, setUser] = React.useState<UserProfile | null>(null);
    const [isReady, setIsReady] = React.useState(false);

    useEffect(() => {
        const user = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (user && token) {
            setUser(JSON.parse(user));
            setToken(token);
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        }
        setIsReady(true);
    }, []);


    const registerUser = async (username: string, email: string, phoneNumber: string, password: string) => {
        await registerAPI(username, email, phoneNumber, password).then((res) => {
            if (res) {
                localStorage.setItem("token", res?.data.token);
                const userObj = {
                    username: res?.data.username,
                };
                localStorage.setItem("user", JSON.stringify(userObj));
                setToken(res?.data.token!);
                setUser(userObj!);
                axios.defaults.headers.common["Authorization"] = "Bearer " + res.data.token;
                toast.success("Register Success!")
            }
        }).catch((e) => toast.warning("Server error occured"));
    };

    const loginUser = async (username: string, password: string) => {
        await loginAPI(username, password).then((res) => {
            if (res) {
                localStorage.setItem("token", res.data.token);
                const userObj = {
                    username: res.data.username,
                };
                localStorage.setItem("user", JSON.stringify(userObj));
                setToken(res.data.token);
                setUser(userObj);
                axios.defaults.headers.common["Authorization"] = "Bearer " + res.data.token;
                toast.success("Login Success!")
            }
        }).catch((e) => toast.warning("Server error occured"));
    };

    const logoutUser = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
        setToken(null);

        navigate("/");
    };

    const isLoggedIn = () => {
        return token !== null;
    };

    return (
        <UserContext.Provider value={{ user, token, registerUser, loginUser, logoutUser, isLoggedIn }}>
            {isReady ? children : null}
        </UserContext.Provider>
    );
};

export const useAuth = () => React.useContext(UserContext);