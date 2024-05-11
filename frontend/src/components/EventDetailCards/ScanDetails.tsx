import * as React from 'react';

interface Props {
    eventId: number;
    scannedTickets: number;
    totalTickets: number;
    scanningState: boolean;
    changeScanningState: () => void;
}

const ScanDetails: React.FC<Props> = ({eventId, scannedTickets, totalTickets, scanningState, changeScanningState}) => {
    return (
        <div>
            <p>{scannedTickets}/{totalTickets} scanned</p>
            {scanningState ? (
                <button onClick={changeScanningState}>Stop scanning</button>
            ) : (
                <button onClick={changeScanningState}>Start scanning</button>
            )}
        </div>
    )
};

export default ScanDetails;