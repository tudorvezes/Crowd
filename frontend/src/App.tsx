import React from 'react';
import './App.css';
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {UserProvider} from "./context/useAuth";
import {Outlet} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";

function App() {
    return (
        <>
              <UserProvider>
                    <Outlet />
                    <ToastContainer />
              </UserProvider>
        </>
    );
}

export default App;
