import * as React from 'react';

import './Modal.css';
import {CreateReport, Report} from "../../model/Report";
import {ScannedTicket, Ticket} from "../../model/Ticket";
import {createReport} from "../../services/ReportService";
import {useEffect} from "react";

interface ModalProps {
    eventId: number;
    ticket: ScannedTicket;
    isOpen: boolean;
    onClose: () => void;
}

const SendReportModal: React.FC<ModalProps> = ({ eventId, ticket, isOpen, onClose }) => {
    const [formData, setFormData] = React.useState<CreateReport>({
        title: '',
        body: '',
    });

    useEffect(() => {
        if (ticket) {
            setFormData({
                title: `#${ticket.uniqueCode}`,
                body: '',
            });
        }
    }, [ticket]);

    if (!isOpen) {
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createReport(eventId, formData);
            onClose();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-content">
                    <span className="close" onClick={onClose}>&times;</span>
                    <h2>Send Report</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="body">Body</label>
                            <textarea
                                id="body"
                                name="body"
                                value={formData.body}
                                onChange={handleTextAreaChange}
                            />
                        </div>
                        <button type="submit">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SendReportModal;