import * as React from 'react';
import {ShortEvent} from "../../model/Event";
import {useNavigate} from "react-router-dom";

import './EventCard.css';
import '../../App.css';
import {useEffect} from "react";
import superAdminIcon from "../../assets/icons/super_admin_icon.svg";

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
            <div className="code-container">
                <h4>{event.uniqueCode}</h4>
                {event.yourPermission === 0 && (
                    <img src={superAdminIcon} alt="super admin icon" className="super-admin-icon"/>
                )}
            </div>
        </div>
    );
};

export default EventCard;