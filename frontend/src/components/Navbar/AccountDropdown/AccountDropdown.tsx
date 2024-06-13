import * as React from 'react';
import {useAuth} from "../../../context/useAuth";
import "./AccountDropdown.css";

const AccountDropdown = () => {
    const {user, logoutUser} = useAuth();

    const handleLogout = () => {
        logoutUser();
    }

    return (
        <>
            <div className="dropdown">
                <button className="drop-button">{user?.username}</button>
                <div className="dropdown-content">
                    <a href="#">Profile</a>
                    <a onClick={logoutUser}>Logout</a>
                </div>
            </div>
        </>
    )
};

export default AccountDropdown;