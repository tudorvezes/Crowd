import * as React from 'react';
import {LongEvent} from "../../model/Event";
import "./Modal.css";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ConnectionLostModal: React.FC<ModalProps> = ({isOpen, onClose}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <button className="modal-close" onClick={onClose}>
                    Close
                </button>
                <h1>The connection to the server was lost</h1>
            </div>
        </div>
    );
};

export default ConnectionLostModal;