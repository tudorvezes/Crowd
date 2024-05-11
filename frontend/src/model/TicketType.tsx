import * as React from 'react';

export type TicketType = {
    id: number;
    name: string;
    price: number;
    currency: string;
    quantity: number;
};

export type CreateTicketType = {
    name: string;
    price: number;
    currency: string;
    quantity: number;
};