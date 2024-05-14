import * as React from 'react';
import EventCard from "../EventCard/EventCard";
import {ShortEvent} from "../../model/Event";

import './EventCardList.css';

type Props = {
    events: ShortEvent[];
};

const EventCardList: React.FC<Props> = ({events}) => {
        return (
        <div className='event-list-container'>
            {events.map(event => <EventCard event={event} key={event.id} />)}
        </div>
    );
};

export default EventCardList;