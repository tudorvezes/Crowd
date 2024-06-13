import * as React from 'react';
import './EventDetailsCards.css';
import '../../App.css'

interface Props {
    eventId: number;
    scannedTickets: number;
    totalTickets: number;
    scanningState: boolean;
    changeScanningState: () => void;
}

const ScanDetails: React.FC<Props> = ({eventId, scannedTickets, totalTickets, scanningState, changeScanningState}) => {
    return (
        <div className='card scan-card'>
            <div className='text-container'>
                <p className='big medium'>{scannedTickets}</p>
                <p className='big regular'>/</p>
                <p className='big regular'>{totalTickets}</p>
                <p className='small regular'>scanned</p>
            </div>

            {scanningState ? (
                <button className='black-button' onClick={changeScanningState}>Stop scanning</button>
            ) : (
                <button className='black-button' onClick={changeScanningState}>Start scanning</button>
            )}
        </div>
    )
};

export default ScanDetails;