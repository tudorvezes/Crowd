import axios from "axios";
import {handleError} from "./ErrorHandler";
import {CreateTicket, Ticket} from "../model/Ticket";
import {toast} from "react-toastify";

export const getTickets = async (eventId: number) => {
    try {
        const response = await axios.get<Ticket[]>(`https://localhost:7121/api/tickets/${eventId}`);
        return response.data; // Return the data from the response
    } catch (error) {
        handleError(error);
    }
};

export const scanTicket = async (eventId: number, ticketCode: string) => {
    try {
        const response = await axios.put<Ticket>(`https://localhost:7121/api/tickets/${eventId}/${ticketCode}/scan`);
        return response.data; // Return the data from the response
    } catch (error) {
        handleError(error);
    }
};

export const unscanTicket = async (eventId: number, ticketId: number) => {
    try {
        const response = await axios.put<Ticket>(`https://localhost:7121/api/tickets/${eventId}/${ticketId}/unscan`);
        return response.data; // Return the data from the response
    } catch (error) {
        handleError(error);
    }
}

export const createTicket = async (eventId: number, ticket: CreateTicket) => {
    try {
        const response = await axios.post<CreateTicket>(`https://localhost:7121/api/tickets/${eventId}`, ticket);
        return response.data; // Return the data from the response
    } catch (error) {
        handleError(error);
    }
}

export const uploadTickets = async (eventId: number, file: File) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post<Ticket[]>(`https://localhost:7121/api/tickets/${eventId}/csv`, formData);
        return response.data; // Return the data from the response
    } catch (error) {
        handleError(error);
    }
}

export const deleteTicket = async (eventId: number, ticketId: number) => {
    try {
        await axios.delete(`https://localhost:7121/api/tickets/${eventId}/${ticketId}`);
    } catch (error) {
        handleError(error);
    }
}
