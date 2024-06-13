import * as React from 'react';
import {useAuth} from "../../context/useAuth";
import {Link} from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Navbar.css";
import AccountDropdown from "./AccountDropdown/AccountDropdown";

const Navbar = () => {
    const {isLoggedIn, user, logoutUser } = useAuth();
    return (
        <nav>
            <div>
                <Link to="/">
                    <img src={logo} alt="CROWD logo"/>
                </Link>
            </div>

            {isLoggedIn() ? (
                <div className='menu'>
                    <Link to="/events" className="nav-text">Manage events</Link>
                    <Link to="/scan" className="nav-text">Scan tickets</Link>
                    <AccountDropdown />
                </div>
            ) : (
                <div>
                    <Link to="/" className="nav-text">Login</Link>
                    <Link to="/register" className="nav-text">Signup</Link>
                </div>
            )}
        </nav>
    )
};

export default Navbar;