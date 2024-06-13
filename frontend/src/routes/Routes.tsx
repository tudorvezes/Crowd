import { createBrowserRouter } from 'react-router-dom';
import Homepage from "../pages/Homepage/Homepage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import ManageEventsPage from "../pages/ManageEventsPage/ManageEventsPage";
import App from "../App";
import EventPage from "../pages/EventPage/EventPage";
import React from "react";
import CreateEventPage from "../pages/CreateEventPage/CreateEventPage";
import NotSupportedPage from "../pages/ErrorPages/NotSupportedPage";
import ScanPage from "../pages/ScanPage/ScanPage";
import UpdateEventPage from "../pages/UpdateEventPage/UpdateEventPage";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { path: '/', element: <Homepage /> },
            { path: '/events', element: <ManageEventsPage /> },
            { path: '/events/create', element: <CreateEventPage />},
            { path: '/register', element: <RegisterPage /> },
            { path: '/event/:eventCode', element: <EventPage /> },
            { path: '/event/:eventCode/edit', element: <UpdateEventPage />},
            { path: '/scan', element: <ScanPage />},
            { path: '/not-supported', element: <NotSupportedPage /> }
        ]
    },
]);