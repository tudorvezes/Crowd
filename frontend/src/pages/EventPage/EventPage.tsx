import * as React from 'react';
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {changeScanningState, getEvent, getEvents} from "../../services/EventService";
import EventNavbar from "../../components/Navbar/EventNavbar";
import {LongEvent} from "../../model/Event";
import EventDetails from "../../components/EventDetailCards/EventDetails";
import ScanDetails from "../../components/EventDetailCards/ScanDetails";
import EventReports from "../../components/EventDetailCards/EventReports";
import {Ticket} from "../../model/Ticket";
import {deleteTicket, downloadTickets, getTickets, scanTicket, unscanTicket} from "../../services/TicketService";
import {toast} from "react-toastify";
import CreateTicketModal from "../../components/Modals/CreateTicketModal";
import UploadFileModal from "../../components/Modals/UploadFileModal";
import * as signalR from '@microsoft/signalr';

import './EventPage.css';
import '../../App.css';
import uploadIcon from "../../assets/icons/upload_FILL0_wght600_GRAD0_opsz40.svg";
import downloadIcon from "../../assets/icons/download_FILL0_wght600_GRAD0_opsz40.svg";
import scanIcon from "../../assets/icons/barcode_reader_FILL0_wght600_GRAD0_opsz40.svg";
import deleteIcon from "../../assets/icons/delete_forever_FILL0_wght600_GRAD0_opsz40.svg";
import addIcon from "../../assets/icons/add_FILL0_wght600_GRAD0_opsz40.svg";
import searchIcon from "../../assets/icons/search_FILL0_wght600_GRAD0_opsz40.svg";
import editIcon from "../../assets/icons/edit_FILL0_wght600_GRAD0_opsz40.svg";
import {handleError} from "../../services/ErrorHandler";
import UpdateTicketModal from "../../components/Modals/UpdateTicketModal";
import ConnectionLostModal from "../../components/Modals/ConnectionLostModal";
import {Report} from "../../model/Report";
import {getReports} from "../../services/ReportService";


type Props = {

}

const EventPage: React.FC<Props> = () => {
    let { eventCode } = useParams();
    const[event, setEvent] = useState<LongEvent>();
    const[eventFetched, setEventFetched] = useState<boolean>(false);

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const [searchBar, setSearchBar] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Ticket[]>([]);

    const [totalTickets, setTotalTickets] = useState<number>(0);
    const [soldTickets, setSoldTickets] = useState<number>(0);
    const [scannedTickets, setScannedTickets] = useState<number>(0);

    const [reports, setReports] = useState<Report[]>([]);

    // Connection
    const [connection, setConnection] = useState<signalR.HubConnection>();
    const [oldConnection, setOldConnection] = useState<signalR.HubConnection>();

    // Modals
    const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState<boolean>(false);
    const openCreateTicketModal = () => setIsCreateTicketModalOpen(true);
    const closeCreateTicketModal = () => setIsCreateTicketModalOpen(false);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
    const openUploadModal = () => setIsUploadModalOpen(true);
    const closeUploadModal = () => setIsUploadModalOpen(false);

    const [isUpdateTicketModalOpen, setIsUpdateTicketModalOpen] = useState<boolean>(false);
    const openUpdateTicketModal = () => setIsUpdateTicketModalOpen(true);
    const closeUpdateTicketModal = () => setIsUpdateTicketModalOpen(false);

    const [isConnectionLostModalOpen, setIsConnectionLostModalOpen] = useState<boolean>(false);
    const openConnectionLostModal = () => setIsConnectionLostModalOpen(true);
    const closeConnectionLostModal = () => setIsConnectionLostModalOpen(false);


    useEffect(() => {
        document.title = "Loading... | Event Manager";

        fetchEvent().then(() => {
            console.log("Event fetched");
        });
    }, []);

    useEffect(() => {
        if (event) {
            document.title = event.name + " | Event Manager";

            fetchTickets().then((fetchedTickets) => {
                console.log("Tickets fetched");

                if (fetchedTickets) {
                    setTotalTickets(event.capacity);
                    setSoldTickets(fetchedTickets.length);
                    setScannedTickets(fetchedTickets.filter(ticket => ticket.scanned).length);
                }
            });

            fetchReports().then(() => {
                console.log("Reports fetched");
            });

            const newConnection = new signalR.HubConnectionBuilder()
                .withUrl("https://localhost:7121/notificationHub", { withCredentials: true })
                .build();

            setConnection(newConnection);
        }
    }, [eventFetched]);

    useEffect(() => {
        if (connection) {
            connection.start().then(() => {
                console.log("Connection started for: ", connection.connectionId);
                connection.invoke("SubscribeToEvent", event!.id.toString()).then();
            }).catch(err => console.error("Error starting connection:", err));

            connection.on("Connected", (eventId: string) => {
                console.log("Connected for event:", eventId);
            });

            connection.on("EventScanningStateChanged", (state: number) => {
                const newEvent = {...event!, scanningState: state === 1};
                setEvent(newEvent);
            });

            connection.on("EventUpdated", () => {
                setIsConnectionLostModalOpen(true);
                if (event) {
                    connection.invoke("UnsubscribeFromEvent", event.id.toString()).then(() => {
                    }).catch(err => console.error("Error unsubscribing from event:", err));
                }
            });

            connection.on("TicketAdded", (ticket: Ticket) => {
                setTickets(prevTickets => [...prevTickets, ticket]);
                setSoldTickets(prevSoldTickets => prevSoldTickets + 1);
            });

            connection.on("TicketsAdded", (tickets: Ticket[]) => {
                setTickets(prevTickets => [...prevTickets, ...tickets]);
                setSoldTickets(prevSoldTickets => prevSoldTickets + tickets.length);
            });

            connection.on("TicketDeleted", (ticketCode: string, wasScanned: number) => {
                setTickets(tickets => tickets.filter(ticket => ticket.uniqueCode !== ticketCode));
                setSoldTickets(soldTickets => soldTickets - 1);
                if (wasScanned === 1) {
                    setScannedTickets(scannedTickets => scannedTickets - 1);
                }
            });

            connection.on("TicketUpdated", (ticket: Ticket) => {
                setTickets(tickets => tickets.map(t => t.uniqueCode === ticket.uniqueCode ? ticket : t));
            });

            connection.on("TicketScanned", (ticketCode: string) => {
                setTickets(tickets => tickets.map(ticket => {
                    if (ticket.uniqueCode === ticketCode) {
                        return {...ticket, scanned: true};
                    }
                    return ticket;
                }));
                setScannedTickets(scannedTickets => scannedTickets + 1);
            });

            connection.on("TicketUnscanned", (ticketCode: string) => {
                setTickets(tickets => tickets.map(ticket => {
                    if (ticket.uniqueCode === ticketCode) {
                        return {...ticket, scanned: false};
                    }
                    return ticket;
                }));
                setScannedTickets(scannedTickets => scannedTickets - 1);
            });

            connection.on("NewReport", (report: Report) => {
                setReports(prevReports => [report, ...prevReports]);
            });

            return () => {
                connection.stop().then(() => {
                    console.log("Connection stopped");
                }).catch(err => console.error("Error stopping connection:", err));
            }
        }
    }, [connection]);


    useEffect(() => {
        if (searchBar === '') {
            setSearchResults(tickets);
        } else {
            setSearchResults(tickets.filter(ticket => {
                const ticketName = ticket.firstName + " " + ticket.lastName;
                return ticket.uniqueCode.toLowerCase().includes(searchBar.toLowerCase()) || ticketName.toLowerCase().includes(searchBar.toLowerCase()) || ticket.email.toLowerCase().includes(searchBar.toLowerCase());

            }));
        }
    }, [searchBar, tickets]);

    const fetchEvent = async () => {
        try {
            const res = await getEvent(eventCode!);
            if (res) {
                setEvent(res);
                setEventFetched(true);
            }
        } catch (e) {
            console.error("Error loading event:", e);
        }
    };

    const fetchTickets = async () => {
        try {
            const res = await getTickets(event?.id!);
            if (res) {
                setTickets(res);
                return res;
            }
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
            toast.error("Failed to fetch tickets");
        }
    };

    const fetchReports = async () => {
        try {
            const res = await getReports(event?.id!);
            if (res) {
                setReports(res);
            }
        } catch (e) {
            console.error("Error loading reports:", e);
        }
    }


    const handleRowClick = (ticket: Ticket) => {
        setSelectedTicket(selectedTicket === ticket ? null : ticket);
    };

    const deleteSelectedTicket = () => {
        if (selectedTicket) {
            deleteTicket(event?.id!, selectedTicket.uniqueCode).then(() => {
                setSelectedTicket(null);
            }).catch(err => {
                toast.error("Failed to delete ticket");
            });
        }
    };

    const scanSelectedTicket = () => {
        if (selectedTicket) {
            scanTicket(event?.id!, selectedTicket.uniqueCode).then((ticket) => {
                setSelectedTicket(null);
            }).catch(err => {
                handleError(err);
            });
        }
    }

    const unscanSelectedTicket = () => {
        if (selectedTicket) {
            unscanTicket(event?.id!, selectedTicket.uniqueCode).then((ticket) => {
                setSelectedTicket(null);
            }).catch(err => {
                toast.error("Ticket not scanned!");
            });
        }
    };

    const changeEventScanningState = () => {
        if (event) {
            changeScanningState(event.id, !event.scanningState).then(() => {

            });
        }
    }

    const handleDownloadTickets = () => {
        if (event) {
            downloadTickets(event).then(() => {
                console.log("Downloaded tickets");
            }).catch(err => {
                handleError(err);
            });
        }
    }


    return (
        <>
            {event ? (
                <div className='main-container'>
                    <EventNavbar eventCode={event.uniqueCode}/>
                    <div className='event-window'>
                        <div className='left-pane'>
                            <EventDetails eventId={event.id} eventName={event.name} soldTickets={soldTickets} totalTickets={totalTickets}/>
                            <ScanDetails eventId={event.id} scannedTickets={scannedTickets} totalTickets={soldTickets} scanningState={event.scanningState} changeScanningState={changeEventScanningState}/>
                            <EventReports reports={reports}/>
                        </div>
                        <div className='right-pane'>
                            <div className='tickets-controls'>
                                <div className='search-bar'>
                                    <img src={searchIcon} alt="Search"/>
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Search..."
                                        value={searchBar} onChange={(e) => setSearchBar(e.target.value)}
                                    />
                                </div>

                                <div className='buttons'>
                                    <button onClick={openUploadModal}>
                                        <img src={uploadIcon} alt="Upload"/>
                                    </button>
                                    <button onClick={handleDownloadTickets}>
                                        <img src={downloadIcon} alt="Download"/>
                                    </button>
                                    {!(selectedTicket && selectedTicket.scanned) ? (
                                        <button onClick={scanSelectedTicket} disabled={!(selectedTicket && event.scanningState)}>
                                            <img src={scanIcon} alt="Scan"/>
                                        </button>
                                    ) : (
                                        <button onClick={unscanSelectedTicket} disabled={!(selectedTicket)}>
                                            <img src={scanIcon} alt="Cancal scan"/>
                                        </button>
                                    )}
                                    <button onClick={openUpdateTicketModal} disabled={!selectedTicket}>
                                        <img src={editIcon} alt="Edit"/>
                                    </button>
                                    <button onClick={deleteSelectedTicket} disabled={!selectedTicket}>
                                        <img src={deleteIcon} alt="Delete"/>
                                    </button>
                                    <button onClick={openCreateTicketModal}>
                                        <img src={addIcon} alt="Add"/>
                                    </button>
                                </div>
                            </div>
                            <div className='table-container'>
                                <table className='table'>
                                    <thead>
                                    <tr>
                                        <th className='col-scanned'></th>
                                        <th className='col-code'>Ticket code</th>
                                        <th className='col-firstname'>First name</th>
                                        <th className='col-lastname'>Last name</th>
                                        <th className='col-email'>Email</th>
                                        <th className='col-phone'>Phone</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {searchResults.map(ticket => (
                                        <tr key={ticket.uniqueCode} onClick={() => handleRowClick(ticket)}
                                            className={selectedTicket === ticket ? 'row-selected' : ''}>
                                            <td className='col-scanned'>
                                                {ticket.scanned ? <span className="bullet green"></span> :
                                                    <span className="bullet red"></span>}
                                            </td>
                                            <td className='col-code'>{ticket.uniqueCode}</td>
                                            <td className='col-firstname'>{ticket.firstName}</td>
                                            <td className='col-lastname'>{ticket.lastName}</td>
                                            <td className='col-email'>{ticket.email}</td>
                                            <td className='col-phone'>{ticket.phone}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <CreateTicketModal event={event} isOpen={isCreateTicketModalOpen} onClose={closeCreateTicketModal} />
                    <UploadFileModal event={event} isOpen={isUploadModalOpen} onClose={closeUploadModal} />
                    <UpdateTicketModal eventModel={event} ticket={selectedTicket!} isOpen={isUpdateTicketModalOpen} onClose={closeUpdateTicketModal} />
                    <ConnectionLostModal isOpen={isConnectionLostModalOpen} onClose={closeConnectionLostModal} />
                </div>
            ) : (
                <div>
                    <h1>Loading...</h1>
                </div>
            )}
        </>
    )
};

export default EventPage;

