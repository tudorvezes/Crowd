import * as React from 'react';
import UpdateEventForm from "../../components/UpdateEventForm/UpdateEventForm";
import {useParams} from "react-router-dom";
import {getFullEvent} from "../../services/EventService";
import {useEffect, useState} from "react";
import {FullEvent} from "../../model/Event";
import Navbar from "../../components/Navbar/Navbar";

const UpdateEventPage: React.FC = () => {
    let {eventCode} = useParams<{eventCode: string}>();
    const [event, setEvent] = useState<FullEvent>();

    useEffect(() => {
        fetchEvent().then();
    }, []);

    const fetchEvent = async () => {
        try {
            const eventModel = await getFullEvent(eventCode!);
            if (eventModel) {
                setEvent(eventModel);
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <Navbar />
            <div className='cl-page-width'>
                <h1>Update event</h1>
                {event && <UpdateEventForm eventModel={event}/>}
            </div>
        </>
    );
};

export default UpdateEventPage;