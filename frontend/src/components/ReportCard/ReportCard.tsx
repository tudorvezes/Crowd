import * as React from 'react';
import { Report } from '../../model/Report';
import './ReportCard.css';

type Props = {
    report: Report;
}

const ReportCard: React.FC<Props> = ({ report }) => {
    const formatDate = (timestamp: string) : string => {
        const date = new Date(timestamp);
        const now = new Date();

        const isSameDay = (d1: Date, d2: Date) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        const isYesterday = (d1: Date, d2: Date) => {
            const yesterday = new Date(d2);
            yesterday.setDate(d2.getDate() - 1);
            return isSameDay(d1, yesterday);
        }

        if (isSameDay(date, now)) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (isYesterday(date, now)) {
            return `y ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString([], { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString();
        }
    }

    return (
        <div className="report-card">
            <div className="username-title-container">
                <p className="username">{report.username}</p>
                <p className="title">{report.title}</p>
            </div>
            <p className="report-body">{report.body}</p>
            <p className="report-timestamp">{formatDate(report.timestamp)}</p>
        </div>
    );
}

export default ReportCard;
