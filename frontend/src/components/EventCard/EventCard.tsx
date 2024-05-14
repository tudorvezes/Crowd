import * as React from 'react';
import {ShortEvent} from "../../model/Event";
import {useNavigate} from "react-router-dom";

import './EventCard.css';
import '../../App.css';
import {useEffect} from "react";

type Props = {
    event: ShortEvent;
};

const EventCard: React.FC<Props> = ({event}) => {
    const navigate = useNavigate();
    const [formattedStartDate, setFormattedDate] = React.useState<string>("");
    const [formattedEndDate, setFormattedEndDate] = React.useState<string>("");

    const handleClick = () => {
        navigate(`/event/${event.uniqueCode}`);
    };

    useEffect(() => {
        if (event.startDate) {
            const date = new Date(event.startDate);
            setFormattedDate(date.toLocaleDateString('en-GB'));
        }
        if (event.endDate) {
            const date = new Date(event.endDate);
            setFormattedEndDate(date.toLocaleDateString('en-GB'));
        }
    }, []);

    return (
        <div className="event-card" onClick={handleClick}>
            <div>
                <h3>{event.name}</h3>
                {formattedStartDate === formattedEndDate ? (
                    <p>{formattedStartDate}</p>
                ) : (
                    <p>{formattedStartDate} - {formattedEndDate}</p>)
                }
            </div>
            <h4>{event.uniqueCode}</h4>
        </div>
    );
};

export default EventCard;