import * as React from 'react';
import {Report} from "../../model/Report";
import ReportCard from "../ReportCard/ReportCard";

type Props = {
    reports: Report[];
}

const ReportList: React.FC<Props> = ({reports}) => {
    return (
        <div className="report-container">
            {reports.length > 0 ? (
                reports.map((report, index) => (
                    <ReportCard key={index} report={report}/>
                ))
            ) : (
                <div className="no-reports">
                    <p>No reports to display</p>
                </div>
            )}
        </div>
    );
}

export default ReportList;