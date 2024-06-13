import * as React from 'react';
import { Ticket, UpdateTicket } from "../../model/Ticket";
import { LongEvent } from "../../model/Event";
import { useEffect, useState } from "react";
import {updateTicket} from "../../services/TicketService";

interface ModalProps {
    eventModel: LongEvent;
    ticket: Ticket;
    isOpen: boolean;
    onClose: () => void;
}

const UpdateTicketModal: React.FC<ModalProps> = ({ eventModel, ticket, isOpen, onClose }) => {
    const [formData, setFormData] = useState<UpdateTicket>({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        email: "",
        phone: "",
        address: "",
        other: "",
        ticketTypeId: -1,
    });

    useEffect(() => {
        if (!ticket) {
            return;
        }
        const date = new Date(ticket.dateOfBirth);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        setFormData({
            firstName: ticket.firstName,
            lastName: ticket.lastName,
            dateOfBirth: formattedDate,
            email: ticket.email,
            phone: ticket.phone,
            address: ticket.address,
            other: ticket.other,
            ticketTypeId: ticket.ticketTypeId,
        });
    }, [ticket]);

    if (!isOpen) {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventModel || !ticket) {
            return;
        }

        updateTicket(eventModel.id, ticket.uniqueCode, formData).then(() => {
            onClose();
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <button className="modal-close" onClick={onClose}>
                    Close
                </button>
                <h1>Update ticket</h1>
                {formData ? (
                    <form onSubmit={handleSubmit}>
                        <label>
                            Ticket code:
                            <input type="text" name="ticketCode" defaultValue={ticket.uniqueCode} />
                        </label>
                        <label>
                            First name:
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
                        </label>
                        <label>
                            Last name:
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                        </label>
                        <label>
                            Date of birth:
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                        </label>
                        <label>
                            Email:
                            <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        </label>
                        <label>
                            Phone:
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                        </label>
                        <label>
                            Address:
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </label>
                        <label>
                            Other:
                            <textarea name="other" value={formData.other} onChange={handleTextAreaChange} />
                        </label>
                        <label>
                            Ticket type:
                            <select name="ticketTypeId" value={formData.ticketTypeId} onChange={handleChange}>
                                {eventModel.ticketTypes.map(ticketType => (
                                    <option key={ticketType.id} value={ticketType.id}>
                                        {ticketType.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button type="submit">
                            Update ticket
                        </button>
                    </form>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
};

export default UpdateTicketModal;
