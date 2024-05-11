import * as React from 'react';
import {LongEvent} from "../../model/Event";
import "./Modal.css";
import {useRef} from "react";
import {uploadTickets} from "../../services/TicketService";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";

interface ModalProps {
    event: LongEvent;
    isOpen: boolean;
    onClose: () => void;
}

const UploadFileModal: React.FC<ModalProps> = ({event, isOpen, onClose}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = React.useState<File | null>(null);

    if (!isOpen) {
        return null;
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            // Check if the file is a CSV
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                setFile(file);
            } else {
                console.error('Selected file is not a CSV.');
                return;
            }
        }
    };

    const handleUpload = () => {
        if (file) {
            uploadTickets(event.id, file)
                .then((res) => {
                    if (res) {
                        toast.success('Tickets uploaded successfully');
                        window.location.reload();
                    }
                });
        }
    }

    const handleDownload = () => {
        // Download the template file
        console.log('Downloading template');
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <button className="modal-close" onClick={onClose}>
                    Close
                </button>
                <h1>Upload file</h1>
                <button onClick={handleDownload}>
                    Download template
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv" // Only allow CSV files
                    onChange={handleFileUpload}
                />
                <button onClick={handleUpload}>
                    Upload
                </button>
            </div>
        </div>
    );
};

export default UploadFileModal;