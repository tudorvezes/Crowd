import * as React from 'react';
import {LongEvent} from "../../model/Event";
import "./Modal.css";
import CreateTicketForm from "../CreateTicketForm/CreateTicketForm";

interface ModalProps {
    event: LongEvent;
    isOpen: boolean;
    onClose: () => void;
}

const CreateTicketModal: React.FC<ModalProps> = ({event, isOpen, onClose}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <button className="modal-close" onClick={onClose}>
                    Close
                </button>
                <h1>Create ticket</h1>
                <CreateTicketForm event={event} />
            </div>
        </div>
    );
};

export default CreateTicketModal;