import * as React from 'react';
import * as Yup from 'yup';
import {string} from "yup";
import {useAuth} from "../../context/useAuth";
import {useForm} from "react-hook-form";
import {UserRegister} from "../../model/AppUser";
import {yupResolver} from "@hookform/resolvers/yup";

const validation = Yup.object().shape({
    username: string().required('Username is required'),
    email: string().email('Email is invalid').required('Email is required'),
    phoneNumber: string().required('Phone is required'),
    password: string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const RegisterPage = () => {
    const {registerUser} = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<UserRegister>({ resolver: yupResolver(validation)});

    const handleRegister = (form: UserRegister) => {
        registerUser(form.username, form.email, form.phoneNumber, form.password);
    }

    return (
        <section>
            <div>
                <h1>
                    Register
                </h1>
                <form onSubmit={handleSubmit(handleRegister)}>
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
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Email"
                            {...register("email")}
                        />
                        {errors.email ? (<p>{errors.email.message}</p>) : ('')}
                    </div>
                    <div>
                        <label htmlFor="phone">Phone</label>
                        <input
                            type="text"
                            id="phone"
                            placeholder="Phone"
                            {...register("phoneNumber")}
                        />
                        {errors.phoneNumber ? (<p>{errors.phoneNumber.message}</p>) : ('')}
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            {...register("password")}
                        />
                        {errors.password ? (<p className="text-white">{errors.password.message}</p>) : ('')}
                    </div>
                    <button type="submit">Register</button>
                </form>
            </div>
        </section>
    );
}

export default RegisterPage;