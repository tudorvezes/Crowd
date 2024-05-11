import * as React from 'react';
import * as Yup from 'yup';
import {string} from "yup";
import {useAuth} from "../../context/useAuth";
import {useForm} from "react-hook-form";
import {UserLogin, UserRegister} from "../../model/AppUser";
import {yupResolver} from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import {useEffect} from "react";
import {getEvents} from "../../services/EventService";
import Navbar from "../../components/Navbar/Navbar";


const validation = Yup.object().shape({
    username: string().required('Username is required'),
    password: string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const HomePage = () => {
    const {loginUser, isLoggedIn} = useAuth();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserLogin>({ resolver: yupResolver(validation)});

    const handleLogin = async (form: UserLogin) => {
        loginUser(form.username, form.password);
    }

    React.useEffect(() => {
        if (isLoggedIn()) {
            navigate("/events");
        }
    }, [isLoggedIn()]);

    return (
        <>
            <Navbar />
            <section>
                <div>
                    <h1>
                        Login
                    </h1>
                    <form onSubmit={handleSubmit(handleLogin)}>
                        <div>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="Username"
                                {...register("username")}
                            />
                            {errors.username ? (
                                <p>{errors.username.message}</p>
                            ) : ('')}
                        </div>
                        <div>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Password"
                                {...register("password")}
                            />
                            {errors.password ? (<p>{errors.password.message}</p>) : ('')}
                        </div>
                        <button type="submit">Login</button>
                    </form>
                </div>
            </section>
        </>
    );
};

export default HomePage;
