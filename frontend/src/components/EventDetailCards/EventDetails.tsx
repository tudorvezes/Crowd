import * as React from 'react';
import './EventDetailsCards.css';
import '../../App.css'

type Props = {
    eventId: number;
    eventName: string;
    soldTickets: number;
    totalTickets: number;
}

const EventDetails: React.FC<Props> = ({eventId, eventName, soldTickets, totalTickets}) => {
    return (
        <div className='card details-card'>
            <h3>{eventName}</h3>

            <div className='text-container'>
                <p className='big medium'>{soldTickets}</p>
                <p className='big regular'>/</p>
                <p className='big regular'>{totalTickets}</p>
                <p className='small regular'>sold</p>
            </div>
        </div>
    )
};

export default EventDetails;