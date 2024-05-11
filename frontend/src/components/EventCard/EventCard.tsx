import * as React from 'react';
import './EventCard.css';
import {ShortEvent} from "../../model/Event";
import {useNavigate} from "react-router-dom";

type Props = {
    event: ShortEvent;
};

const EventCard: React.FC<Props> = ({event}) : JSX.Element => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/event/${event.uniqueCode}`);
    }

    return (
        <div className="event-card" onClick={handleClick}>
            <h3>{event.name}</h3>
            <p>{event.startDate}</p>
            <h4>{event.uniqueCode}</h4>
        </div>
    );
};

export default EventCard;