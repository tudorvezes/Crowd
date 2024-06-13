import axios from "axios";
import {CreateReport, Report} from "../model/Report";
import {handleError} from "./ErrorHandler";

export const getReports = async (eventId: number) => {
    try {
        const response = await axios.get<Report[]>(`https://localhost:7121/api/report/${eventId}/`);
        return response.data; // Return the data from the response
    } catch (error) {
        handleError(error);
    }
}

export const createReport = async (eventId: number, report: CreateReport) => {
    try {
        await axios.post(`https://localhost:7121/api/report/${eventId}`, report);
    } catch (error) {
        handleError(error);
    }
}