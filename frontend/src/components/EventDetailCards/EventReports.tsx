import * as React from 'react';
import './EventDetailsCards.css';
import {Report} from "../../model/Report";
import ReportList from "../ReportList/ReportList";

type Props = {
    reports: Report[];
}

const EventReports: React.FC<Props> = ({reports}) => {
    return (
        <div className='card notifications-card'>
            <h3>Notifications</h3>
            <ReportList reports={reports}/>
        </div>
    )
};

export default EventReports;

