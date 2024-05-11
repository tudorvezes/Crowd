import * as React from 'react';

type Props = {
    eventId: number;
    eventName: string;
    soldTickets: number;
    totalTickets: number;
}

const EventDetails: React.FC<Props> = ({eventId, eventName, soldTickets, totalTickets}) => {
    return (
        <div>
            <h1>{eventName}</h1>
            <p>{soldTickets}/{totalTickets} sold</p>
        </div>
    )
};

export default EventDetails;