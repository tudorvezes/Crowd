import axios from "axios";
import {handleError} from "./ErrorHandler";
import {CreateTicket, ScannedTicket, Ticket, UpdateTicket} from "../model/Ticket";
import {LongEvent} from "../model/Event";

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
        const response = await axios.put<ScannedTicket>(`https://localhost:7121/api/tickets/${eventId}/${ticketCode}/scan`);
        return response.data; // Return the data from the response
    } catch (error) {
        throw error;
    }
};

export const unscanTicket = async (eventId: number, ticketCode: string) => {
    try {
        const response = await axios.put<Ticket>(`https://localhost:7121/api/tickets/${eventId}/${ticketCode}/unscan`);
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

export const deleteTicket = async (eventId: number, ticketCode: string) => {
    try {
        await axios.delete(`https://localhost:7121/api/tickets/${eventId}/${ticketCode}`);
    } catch (error) {
        handleError(error);
    }
}

export const updateTicket = async (eventId: number, ticketCode: string, ticket: UpdateTicket) => {
    try {
        const response = await axios.put<Ticket>(`https://localhost:7121/api/tickets/${eventId}/${ticketCode}`, ticket);
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

export const downloadTickets = async (eventModel: LongEvent) => {
    try {
        const response = await axios.get(`https://localhost:7121/api/tickets/${eventModel.id}/csv`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${eventModel.name}_${eventModel.uniqueCode}_tickets.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Clean up the link element after downloading
        window.URL.revokeObjectURL(url); // Release the object URL

    } catch (error) {
        console.error('Error downloading the CSV file:', error);
    }
};