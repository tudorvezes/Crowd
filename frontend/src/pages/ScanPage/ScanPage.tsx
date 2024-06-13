import * as React from 'react';
import {useNavigate} from "react-router-dom";
import {LongEvent, ShortEvent} from "../../model/Event";
import {useEffect, useState} from "react";
import {getShortEvent} from "../../services/EventService";
import {scanTicket} from "../../services/TicketService";
import {ScannedTicket, Ticket} from "../../model/Ticket";
import axios from "axios";
import {toast} from "react-toastify";
import { Scanner } from '@yudiel/react-qr-scanner';
import Navbar from "../../components/Navbar/Navbar";

import './ScanPage.css';
import forwardIcon from '../../assets/icons/arrow_forward_ios_24dp_FILL0_wght600_GRAD0_opsz40.svg';
import exitIcon from '../../assets/icons/logout_24dp_FILL0_wght600_GRAD0_opsz24.svg';
import succesIcon from '../../assets/icons/task_alt_24dp_FILL0_wght600_GRAD0_opsz24.svg';
import errorIcon from '../../assets/icons/error_24dp_FILL0_wght600_GRAD0_opsz24.svg';
import cameraSwitchIcon from '../../assets/icons/cameraswitch_24dp_FILL0_wght600_GRAD0_opsz24.svg';
import torchOnIcon from '../../assets/icons/flash_on_24dp_FILL0_wght600_GRAD0_opsz24.svg';
import torchOffIcon from '../../assets/icons/flash_off_24dp_FILL0_wght600_GRAD0_opsz24.svg';
import reportBugIcon from '../../assets/icons/bug_report_24dp_FILL0_wght600_GRAD0_opsz24.svg';
import {useAuth} from "../../context/useAuth";
import SendReportModal from "../../components/Modals/SendReportModal";

interface MediaDevice {
    label: string;
    deviceId: string;
    groupId: string;
    kind: string;
}

async function listAllDevices() {
    try {
        // Request permission for media devices and enumerate them
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Filter out video input devices (cameras) and sort them by label
        const videoDevices = devices
            .filter((device) => device.kind === "videoinput")
            .sort((a, b) => {
                if (a.label.includes("camera2 0")) {
                    return -1;
                }

                if (b.label.includes("camera2 0")) {
                    return 1;
                }

                return 0;
            });

        // Map each video device to an object with relevant properties
        const cameras : MediaDevice[] = videoDevices.map((device) => ({
            label: device.label || "Unknown Camera", // Provide a default label if none is available
            deviceId: device.deviceId,
            groupId: device.groupId, // Devices with the same "groupId" are on the same physical device
            kind: device.kind,
        }));

        return cameras;
    } catch (error) {
        console.error("Error accessing media devices:", error);
        return [];
    }
}

const ScanPage = () => {
    const {user} = useAuth();
    const [eventModel, setEventModel] = React.useState<ShortEvent>();
    const [eventCode, setEventCode] = useState<string>('');
    const [ticketCode, setTicketCode] = useState<string>('');
    const [lastScannedTicket, setLastScannedTicket] = useState<ScannedTicket>();
    const [firstTicketScanned, setFirstTicketScanned] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [formattedDateOfBirth, setFormattedDateOfBirth] = useState<string>('');

    const [devices, setDevices] = useState<MediaDevice[]>([]);
    const [deviceIndex, setDeviceIndex] = useState<number>(0);
    const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
    const [scannerEnabled, setScannerEnabled] = useState<boolean>(true);

    // Modal
    const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
    const closeReportModal = () => setIsReportModalOpen(false);
    const openReportModal = () => setIsReportModalOpen(true);

    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Scan tickets | Crowd";

        listAllDevices().then((devices) => {
            if (devices.length === 0) {
                console.error("No video input devices found");
                return;
            }
            setDevices(devices);
            setDeviceIndex(0);
        });

        const eventCode = localStorage.getItem("scanEventCode")
        if (eventCode) {
            getShortEvent(eventCode).then((event) => {
                if (event) {
                    setEventModel(event);
                }
            }).catch(() => {
                    console.log("Event not found");
                }
            );
        }
    }, []);

    useEffect(() => {
        if (eventModel) {
            document.title = `${eventModel.name} | Scan tickets`;
            localStorage.setItem("scanEventCode", eventModel.uniqueCode);
        }
    }, [eventModel]);

    const handleEventCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value.length > 6) {
            return;
        }
        setEventCode(event.target.value.toUpperCase());
    };

    const handleEventCodeSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (eventCode.length !== 6) {
            return;
        }
        getShortEvent(eventCode).then((ev) => {
            if (ev) {
                setEventModel(ev);
            }
        }).catch(() => {
                console.log("Event not found");
            }
        );
    };

    const handleTicketCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTicketCode(event.target.value);
    };

    const handleTicketCodeSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFirstTicketScanned(true);
        scanTicket(eventModel!.id, ticketCode).then((response) => {
            if (response) {
                setLastScannedTicket(response);
                const date = new Date(response.dateOfBirth);
                setFormattedDateOfBirth(date.toLocaleDateString('en-GB'));

                const domCamera = document.getElementById('camera');
                if (response.success) {
                    if (domCamera) {
                        domCamera.classList.remove('white-shadow');
                        domCamera.classList.remove('red-shadow');
                        domCamera.classList.remove('green-shadow');
                        void domCamera.offsetWidth;
                        domCamera.classList.add('green-shadow');
                    }
                } else {
                    if (domCamera) {
                        domCamera.classList.remove('white-shadow');
                        domCamera.classList.remove('green-shadow');
                        domCamera.classList.remove('red-shadow');
                        void domCamera.offsetWidth;
                        domCamera.classList.add('red-shadow');
                    }
                }
            }
        }).catch((e) => {
            handleScanError(e);
            setLastScannedTicket(undefined);
            const domCamera = document.getElementById('camera');
            if (domCamera) {
                domCamera.classList.remove('white-shadow');
                domCamera.classList.remove('green-shadow');
                domCamera.classList.remove('red-shadow');
                void domCamera.offsetWidth;
                domCamera.classList.add('red-shadow');
            }
        });
    };

    const handleScan = (text: string) => {
        if (!scannerEnabled) {
            return;
        }
        console.log("Scanned ticket code:", text);

        if (text === lastScannedTicket?.uniqueCode) {
            return;
        }

        setTicketCode(text);

        scanTicket(eventModel!.id, text).then((response) => {
            if (response) {
                setLastScannedTicket(response);
                const date = new Date(response.dateOfBirth);
                setFormattedDateOfBirth(date.toLocaleDateString('en-GB'));

                const domCamera = document.getElementById('camera');
                if (response.success) {
                    if (domCamera) {
                        domCamera.classList.remove('white-shadow');
                        domCamera.classList.remove('red-shadow');
                        domCamera.classList.remove('green-shadow');
                        void domCamera.offsetWidth;
                        domCamera.classList.add('green-shadow');
                    }
                } else {
                    if (domCamera) {
                        domCamera.classList.remove('white-shadow');
                        domCamera.classList.remove('green-shadow');
                        domCamera.classList.remove('red-shadow');
                        void domCamera.offsetWidth;
                        domCamera.classList.add('red-shadow');
                    }
                }
            }
        }).catch((e) => {
            handleScanError(e);
            setLastScannedTicket(undefined);
            const domCamera = document.getElementById('camera');
            if (domCamera) {
                domCamera.classList.remove('white-shadow');
                domCamera.classList.remove('green-shadow');
                domCamera.classList.remove('red-shadow');
                void domCamera.offsetWidth;
                domCamera.classList.add('red-shadow');
            }
        });
    }

    const handleChangeDevice = () => {
        if (devices.length <= 1) return;
        if (deviceIndex < devices.length - 1) {
            setDeviceIndex((prevIndex) => prevIndex + 1);
        } else {
            setDeviceIndex(0);
        }
    };

    const handleScanError = (scanError: any) => {
        if (axios.isAxiosError(scanError)) {
            let err = scanError.response;

            if (err?.status == 401) {
                toast.warning("you are not authorized to scan tickets for this event.");
            }
            else if (err?.status == 400) {
                setError("ticket already scanned.");
            }
            else if (err?.status == 404) {
                setError("ticket not found.");
            }
            else if (err) {
                setError(JSON.stringify(err.data));
            }
        }
    }

    const handleExitEvent = () => {
        localStorage.removeItem("scanEventCode");
        setEventModel(undefined);
        setLastScannedTicket(undefined);
        setFirstTicketScanned(false);
        setEventCode('');
        setTicketCode('');
        setError('');
    }

    return (
        <>
            {eventModel ? (
                <div className='scan-body'>
                    <div className='mobile-page-width'>
                        <div className='camera-container'>
                            {devices.length > 0 && devices[deviceIndex] ? (
                                <div id='camera' className='scan-camera white-shadow'>
                                    <div className="button-container">
                                        <button className="toggle-torch-button" onClick={setTorchEnabled.bind(null, !torchEnabled)}>
                                            {torchEnabled ? (
                                                <img src={torchOnIcon} alt="Turn off torch"/>
                                            ) : (
                                                <img src={torchOffIcon} alt="Turn on torch"/>
                                            )}
                                        </button>
                                        {devices.length > 1 && (
                                        <button className="change-device-button" onClick={handleChangeDevice}>
                                            <img src={cameraSwitchIcon} alt="Change camera"/>
                                        </button>
                                        )}
                                    </div>
                                    <Scanner
                                        onResult={(text, result) => handleScan(text)}
                                        onError={(error) => console.log(error?.message)}
                                        options={{
                                            deviceId: devices[deviceIndex].deviceId,
                                            delayBetweenScanSuccess: 3000,
                                        }}
                                        components={{
                                            tracker: true,
                                            torch: torchEnabled,
                                        }}
                                        styles={{
                                            container: {
                                                borderRadius: '10px',
                                            },
                                            video: {
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            },
                                        }}
                                    />
                                </div>
                            ) : (
                                <p>No video input devices found</p>
                            )}

                            <form onSubmit={handleTicketCodeSubmit}>
                                <input className='input-field' type="text" value={ticketCode} onChange={handleTicketCodeChange}/>
                                <button className='icon-button' type="submit">
                                    <img src={forwardIcon} alt="Scan ticket"/>
                                </button>
                            </form>
                        </div>

                        <div className='ticket-info'>
                            {lastScannedTicket ? (
                                <div className='scanned'>
                                    <h1>{lastScannedTicket.lastName} {lastScannedTicket.firstName}</h1>
                                    <div className='button-message-container'>
                                        <div className='message-container'>
                                            {lastScannedTicket.success ? (
                                                <div className='message success'>
                                                    <img src={succesIcon} alt="Succesful scan"/>
                                                    <p>Ticket successfully scanned.</p>
                                                </div>
                                            ) : (
                                                <div className='message error'>
                                                    <img src={errorIcon} alt="Error scanning"/>
                                                    <p>Ticket already scanned.</p>
                                                </div>
                                            )}
                                            <div className='message ticket-type-name'>
                                                <p>{lastScannedTicket.ticketTypeName}</p>
                                            </div>
                                        </div>

                                        {!lastScannedTicket.success && (
                                            <div className='message as-button' onClick={openReportModal}>
                                                <img src={reportBugIcon} alt="Report bug"/>
                                                <p>Report a problem</p>
                                            </div>
                                        )}
                                    </div>

                                    <br/>
                                    <p>Date of birth: {formattedDateOfBirth}</p>
                                    <p>E-mail: {lastScannedTicket.email}</p>
                                    <p>Phone: {lastScannedTicket.phone}</p>
                                    {lastScannedTicket.address && (
                                        <p>Address: {lastScannedTicket.address}</p>
                                    )}

                                </div>
                            ) : (
                                <div className='full-message'>
                                    {firstTicketScanned ? (
                                        <>
                                            <h1>{error}</h1>
                                            <div className='message as-button' onClick={openReportModal}>
                                                <img src={reportBugIcon} alt="Report bug"/>
                                                <p>Report a problem</p>
                                            </div>
                                        </>
                                    ) : (
                                        <h1>start scanning.<br/>type a ticket code.</h1>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='event-info'>
                        <div className='event-details'>
                            <h3>{eventModel.name}</h3>
                            <h4>{user?.username}@{eventModel.uniqueCode}</h4>
                        </div>
                        <button onClick={handleExitEvent}>
                            <img src={exitIcon} alt="Exit event"/>
                        </button>
                    </div>

                    <SendReportModal eventId={eventModel.id} ticket={lastScannedTicket!} isOpen={isReportModalOpen} onClose={closeReportModal}/>
                </div>
            ) : (
                <>
                    <Navbar/>
                    <div className="centre-page">
                        <div className='form-container'>
                            <h1>One more step.<br/>Enter the event code</h1>
                            <form onSubmit={handleEventCodeSubmit}>
                                <input
                                    className='input-field'
                                    type="text" value={eventCode}
                                    placeholder="Type the event code"
                                    onChange={handleEventCodeChange}/>
                                <button
                                    className='white-button'
                                    type="submit">Scan tickets
                                </button>
                            </form>
                        </div>

                    </div>
                </>
            )}
        </>
    )
};

export default ScanPage;