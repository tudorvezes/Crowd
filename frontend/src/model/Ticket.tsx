import * as React from "react";

export type Ticket = {
    eventId: number;
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

export type UpdateTicket = {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    phone: string;
    address: string;
    other: string;

    ticketTypeId: number;
};

export type ScannedTicket = {
    success: boolean;

    eventId: number;
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
    ticketTypeName: string;
}