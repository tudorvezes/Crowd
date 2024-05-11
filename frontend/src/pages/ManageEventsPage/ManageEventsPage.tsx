import * as React from 'react';
import {ShortEvent} from "../../model/Event";
import {getEvents} from "../../services/EventService";
import EventCardList from "../../components/EventCardList/EventCardList";
import {useAuth} from "../../context/useAuth";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import Navbar from "../../components/Navbar/Navbar";

const ManageEventsPage = () => {
    const {isLoggedIn} = useAuth();

    const [events, setEvents] = React.useState<ShortEvent[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isLoggedIn()) {
            navigate("/");
        }

        fetchEvents();
    }, []);

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
            <div>
                <div>
                    <h1>Manage Events</h1>
                    <button onClick={() => navigate("/events/create")}>Create Event</button>
                </div>
                <EventCardList events={events}/>
            </div>
        </>
    )
};


export default ManageEventsPage;