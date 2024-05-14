import * as React from 'react';
import {PermissionType} from "./Permission";
import {CreateTicketType, TicketType} from "./TicketType";


export type ShortEvent = {
    id: number;
    uniqueCode: string;
    name: string;
    startDate: string;
    endDate: string;
    yourPermission: PermissionType;
};

export type LongEvent = {
    id: number;
    uniqueCode: string;
    name: string;
    startDate: string;
    endDate: string;
    capacity: number;
    overselling: boolean;
    scanningState: boolean;
    yourPermission: PermissionType;
    ticketTypes: TicketType[];
};

export type CreateEvent = {
    name: string;
    startDate: string;
    endDate: string;
    capacity: number;
    overselling: boolean;
    ticketTypes: CreateTicketType[];
    superAdmins: string[];
    admins: string[];
    scanners: string[];
};