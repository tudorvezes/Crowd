import * as React from 'react';
import * as Yup from 'yup';
import {string} from "yup";
import {useAuth} from "../../context/useAuth";
import {useForm} from "react-hook-form";
import {UserLogin, UserRegister} from "../../model/AppUser";
import {yupResolver} from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import {useEffect} from "react";
import HomeNavbar from "../../components/Navbar/HomeNavbar";

import './Homepage.css';
import coverPhoto from '../../assets/images/Screenshot 2024-03-09 012900.png'


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

    useEffect(() => {
        document.title = "Crowd";
        if (isLoggedIn()) {
            navigate("/events");
        }
    }, [isLoggedIn()]);

    return (
        <div className='main-container'>
            <HomeNavbar />
            <div className='window'>
                <div className='page-width'>
                    <div className='left-window'>
                        <h1>
                            Seamlessly <br/>scan your way
                        </h1>
                        <form onSubmit={handleSubmit(handleLogin)}>
                            <div className='input-fields'>
                                <label>
                                    <input
                                        type="text"
                                        id="username"
                                        className='input-field'
                                        placeholder="Type your username"
                                        {...register("username")}
                                    />
                                    {errors.username ? (
                                        <p>{errors.username.message}</p>
                                    ) : ('')}
                                </label>
                                <label>
                                    <input
                                        type="password"
                                        id="password"
                                        className='input-field'
                                        placeholder="Type your password"
                                        {...register("password")}
                                    />
                                    {errors.password ? (<p>{errors.password.message}</p>) : ('')}
                                </label>
                            </div>
                            <div className='buttons-row'>
                                <button className='white-button' style={{maxWidth: '180px'}} type="submit">
                                    Manage events
                                </button>
                                <button className='white-button' style={{maxWidth: '180px'}}>
                                    Scan tickets
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="right-window">
                    <img src={coverPhoto} alt="coverPhoto" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
