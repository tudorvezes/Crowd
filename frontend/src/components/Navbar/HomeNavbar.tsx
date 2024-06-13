import * as React from 'react';
import {useAuth} from "../../context/useAuth";
import {Link} from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Navbar.css";
import AccountDropdown from "./AccountDropdown/AccountDropdown";

const HomeNavbar = () => {
    const {isLoggedIn, user, logoutUser } = useAuth();
    return (
        <nav>
            <div>
                <Link to="/">
                    <img src={logo} alt="CROWD logo"/>
                </Link>
            </div>

            {isLoggedIn() ? (
                <AccountDropdown />
            ) : (
                <div className='menu'>
                    <a href="#" className="nav-text">About Us</a>
                    <a href="#" className="nav-text">Contact</a>
                    <div className="navbar-button">
                        <a style={{ color: "black" }} href="/register" className="nav-text">Sign Up</a>
                    </div>
                </div>
            )}
        </nav>
    )
};

export default HomeNavbar;