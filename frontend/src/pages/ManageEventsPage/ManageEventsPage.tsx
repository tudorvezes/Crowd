import * as React from 'react';
import {ShortEvent} from "../../model/Event";
import {getEvents} from "../../services/EventService";
import EventCardList from "../../components/EventCardList/EventCardList";
import {useAuth} from "../../context/useAuth";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import Navbar from "../../components/Navbar/Navbar";

import './ManageEventsPage.css';
import '../../App.css';

const ManageEventsPage = () => {
    const {token, isLoggedIn} = useAuth();

    const [events, setEvents] = React.useState<ShortEvent[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const navigate = useNavigate();

    React.useEffect(() => {
        document.title = "Manage events | Crowd";
        if (token) {
            fetchEvents();
        }
    }, [token]);

    const fetchEvents = () => {
        getEvents().then((res) => {
            if (res) {
                setEvents(res);
            }
        })
            .catch((e) => {
                toast.error("Error loading events");
            });
    };

    return (
        <>
            <Navbar/>
            <div className='cl-page-width'>
                <div className='horizontal-layout'>
                    <h1 className='extra-bold'>Choose an event</h1>
                    <button className='black-button' onClick={() => navigate("/events/create")}>Add event</button>
                </div>
                <EventCardList events={events}/>
            </div>
        </>
    )
};


export default ManageEventsPage;