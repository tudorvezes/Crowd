import * as React from 'react';
import {useAuth} from "../../context/useAuth";
import {Link} from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Navbar.css";
import AccountDropdown from "./AccountDropdown/AccountDropdown";

type Props = {
    eventCode: string;
}

const EventNavbar: React.FC<Props> = ({eventCode}) => {
    const {isLoggedIn, user, logoutUser } = useAuth();
    return (
        <nav>
            <div>
                {isLoggedIn() ? (
                    <Link to="/events">
                        <img src={logo} alt="CROWD logo"/>
                    </Link>
                    ) : (
                    <Link to="/">
                        <img src={logo} alt="CROWD logo"/>
                    </Link>
                )}
            </div>

            {isLoggedIn() ? (
                <div className='menu'>
                    <p className='event-button'>{eventCode}</p>
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

export default EventNavbar;