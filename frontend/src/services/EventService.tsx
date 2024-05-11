import {CreateEvent, LongEvent, ShortEvent} from "../model/Event";
import axios from "axios";
import {handleError} from "./ErrorHandler";
import {toast} from "react-toastify";

export const getEvents = async () => {
    try {
        const response = await axios.get<ShortEvent[]>("https://localhost:7121/api/event");
        return response.data; // Return the data from the response
    } catch (error) {
        handleError(error);
    }
};

export const getEvent = async (eventCode: string) => {
    try {
        const response = await axios.get<LongEvent>(`https://localhost:7121/api/event/${eventCode}`);
        return response.data; // Return the data from the response
    } catch (error) {
        handleError(error);
    }
};

export const createEvent = async (event: CreateEvent) => {
    try {
        const response = await axios.post<LongEvent>("https://localhost:7121/api/event", event);
        return response.data; // Return the data from the response
    } catch (error) {
        handleError(error);
    }
};

export const changeScanningState = async (eventId: number, scanning: boolean) => {
    try {
        let payload = scanning ? "true" : "false";
        await axios.put(`https://localhost:7121/api/event/${eventId}/scanningState/${payload}`);
        return true;
    } catch (error) {
        handleError(error);
        return false;
    }
}