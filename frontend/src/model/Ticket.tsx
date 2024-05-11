import * as React from "react";

export type Ticket = {
    id: number;
    uniqueCode: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    phone: string;
    address: string;
    other: string;

    scanned: boolean;
    scannedAt: string;

    ticketTypeId: number;
    eventId: number;
    appUserId: string;
};

export type CreateTicket = {
    uniqueCode: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    phone: string;
    address: string;
    other: string;

    ticketTypeId: number;
};