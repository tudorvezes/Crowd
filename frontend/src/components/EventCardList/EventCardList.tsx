import * as React from 'react';
import EventCard from "../EventCard/EventCard";
import {ShortEvent} from "../../model/Event";

type Props = {
    events: ShortEvent[];
};

const EventCardList: React.FC<Props> = ({events}): JSX.Element => {
        return (
        <div>
            {events.map(event => <EventCard event={event} key={event.id} />)}
        </div>
    );
};

export default EventCardList;