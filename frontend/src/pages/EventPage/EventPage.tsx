import * as React from 'react';
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {changeScanningState, getEvent, getEvents} from "../../services/EventService";
import EventNavbar from "../../components/Navbar/EventNavbar";
import {LongEvent} from "../../model/Event";
import EventDetails from "../../components/EventDetailCards/EventDetails";
import ScanDetails from "../../components/EventDetailCards/ScanDetails";
import EventNotifications from "../../components/EventDetailCards/EventNotifications";
import {Ticket} from "../../model/Ticket";
import {deleteTicket, getTickets, scanTicket, unscanTicket} from "../../services/TicketService";
import {toast} from "react-toastify";
import CreateTicketModal from "../../components/Modals/CreateTicketModal";
import UploadFileModal from "../../components/Modals/UploadFileModal";
import * as signalR from '@microsoft/signalr';
import {set} from "react-hook-form";
import {bool} from "yup";

type Props = {

}

const EventPage: React.FC<Props> = () => {
    let { eventCode } = useParams();
    const[event, setEvent] = useState<LongEvent>();
    const[eventConnection, setEventConnection] = useState<signalR.HubConnection>();

    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const [totalTickets, setTotalTickets] = useState<number>(0);
    const [soldTickets, setSoldTickets] = useState<number>(0);
    const [scannedTickets, setScannedTickets] = useState<number>(0);

    const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState<boolean>(false);
    const openCreateTicketModal = () => setIsCreateTicketModalOpen(true);
    const closeCreateTicketModal = () => setIsCreateTicketModalOpen(false);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
    const openUploadModal = () => setIsUploadModalOpen(true);
    const closeUploadModal = () => setIsUploadModalOpen(false);


    useEffect(() => {
        fetchEvent().then(() => {
            console.log("Event fetched");
        });
    }, []);

    useEffect(() => {
        if (event) {
            fetchTickets().then((fetchedTickets) => {
                console.log("Tickets fetched");

                if (fetchedTickets) {
                    setTotalTickets(event.capacity);
                    setSoldTickets(fetchedTickets.length);
                    setScannedTickets(fetchedTickets.filter(ticket => ticket.scanned).length);
                }

            });
        }

    }, [event]);

    useEffect(() => {
        if (!event) {
            return;
        }

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7121/notificationHub", { withCredentials: true })
            .build();

        connection.start().then(() => {
            setEventConnection(connection);
            console.log("Connection started");

            connection.invoke("SubscribeToEvent", event.id.toString()).then(() => {
                console.log("Subscribed to event");
            });
        }).catch(err => console.error("Error starting connection:", err));

        connection.on("Connected", (eventId: string) => {
            console.log("Connected with ID:", eventId);
        });

        connection.on("EventScanningStateChanged", (state: number) => {
            setEvent(event => event ? {...event, scanningState: state === 1} : event);
        });

        connection.on("TicketAdded", (ticket: Ticket) => {
            setTickets(prevTickets => [...prevTickets, ticket]);
            setSoldTickets(prevSoldTickets => prevSoldTickets + 1);
        });

        connection.on("TicketsAdded", (tickets: Ticket[]) => {
            setTickets(prevTickets => [...prevTickets, ...tickets]);
            setSoldTickets(prevSoldTickets => prevSoldTickets + tickets.length);
        });

        connection.on("TicketDeleted", (ticketId: number, wasScanned: number) => {
            console.log("Ticket deleted:", ticketId);
            setTickets(tickets => tickets.filter(ticket => ticket.id !== ticketId));
            setSoldTickets(soldTickets => soldTickets - 1);
            if (wasScanned == 1) {
                setScannedTickets(scannedTickets => scannedTickets - 1);
            }
        });

        connection.on("TicketScanned", (ticketId: number) => {
            setTickets(tickets => tickets.map(ticket => {
                if (ticket.id === ticketId) {
                    return {...ticket, scanned: true};
                }
                return ticket;
            }));
            setScannedTickets(scannedTickets => scannedTickets + 1);
        });

        connection.on("TicketUnscanned", (ticketId: number) => {
            setTickets(tickets => tickets.map(ticket => {
                if (ticket.id === ticketId) {
                    return {...ticket, scanned: false};
                }
                return ticket;
            }));
            setScannedTickets(scannedTickets => scannedTickets - 1);
        });

        return () => {
            connection.invoke("UnsubscribeFromEvent", event.id.toString()).then(() => {
                console.log("Unsubscribed from event");

                connection.stop().then(() => {
                    setEventConnection(undefined);
                    console.log("Connection stopped");
                });
            }).catch(err => console.error("Error unsubscribing from event:", err));

        }
    }, [event]);

    const fetchEvent = async () => {
        try {
            const res = await getEvent(eventCode!);
            if (res) {
                setEvent(res);
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


    const handleRowClick = (ticket: Ticket) => {
        setSelectedTicket(selectedTicket === ticket ? null : ticket);
    };

    const deleteSelectedTicket = () => {
        if (selectedTicket) {
            deleteTicket(event?.id!, selectedTicket.id).then(() => {
                setSelectedTicket(null);
            }).catch(err => {
                toast.error("Failed to delete ticket");
            });
        }
    };

    const scanSelectedTicket = () => {
        if (selectedTicket) {
            scanTicket(event?.id!, selectedTicket.uniqueCode).then((ticket) => {
                const updatedTickets = tickets.map(ticket => {
                    if (ticket === selectedTicket) {
                        return {...ticket, scanned: true};
                    }
                    return ticket;
                });
                setTickets(updatedTickets);
                setScannedTickets(scannedTickets + 1);
                setSelectedTicket(null);
            }).catch(err => {
                toast.error("Ticket already scanned!");
            });
        }
    }

    const unscanSelectedTicket = () => {
        if (selectedTicket) {
            unscanTicket(event?.id!, selectedTicket.id).then((ticket) => {
                const updatedTickets = tickets.map(ticket => {
                    if (ticket === selectedTicket) {
                        return {...ticket, scanned: false};
                    }
                    return ticket;
                });
                setTickets(updatedTickets);
                setScannedTickets(scannedTickets - 1);
                setSelectedTicket(null);
            }).catch(err => {
                toast.error("Ticket not scanned!");
            });
        }
    };

    const changeEventScanningState = () => {
        if (event) {
            changeScanningState(event.id, !event.scanningState).then((res) => {
                if (res) {
                    setEvent({...event, scanningState: !event.scanningState});
                }
            });
        }
    }


    return (
        <>
            {event ? (
                <>
                    <EventNavbar eventCode={event.uniqueCode}/>
                    <div>
                        <div>
                            <EventDetails eventId={event.id} eventName={event.name} soldTickets={soldTickets} totalTickets={totalTickets}/>
                            <ScanDetails eventId={event.id} scannedTickets={scannedTickets} totalTickets={soldTickets} scanningState={event.scanningState} changeScanningState={changeEventScanningState}/>
                            <EventNotifications />
                        </div>
                        <div>
                            <div>
                                <button onClick={openUploadModal}>
                                    Upload Tickets
                                </button>
                                {!(selectedTicket && selectedTicket.scanned) ? (
                                    <button onClick={scanSelectedTicket} disabled={!(selectedTicket && event.scanningState)}>
                                        Scan Selected Ticket
                                    </button>
                                ) : (
                                    <button onClick={unscanSelectedTicket} disabled={!(selectedTicket)}>
                                        Unscan Selected Ticket
                                    </button>
                                )}
                                <button onClick={deleteSelectedTicket} disabled={!selectedTicket}>
                                    Delete Selected Ticket
                                </button>
                                <button onClick={openCreateTicketModal}>
                                    Create Ticket
                                </button>
                            </div>
                            <table>
                                <thead>
                                <tr>
                                    <th>Scanned</th>
                                    <th>Unique code</th>
                                    <th>First name</th>
                                    <th>Last name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                </tr>
                                </thead>
                                <tbody>
                                {tickets.map(ticket => (
                                    <tr key={ticket.id} onClick={() => handleRowClick(ticket)}
                                        style={{backgroundColor: selectedTicket === ticket ? 'lightblue' : 'white'}}>
                                        <td>{ticket.scanned ? "Yes" : "No"}</td>
                                        <td>{ticket.uniqueCode}</td>
                                        <td>{ticket.firstName}</td>
                                        <td>{ticket.lastName}</td>
                                        <td>{ticket.email}</td>
                                        <td>{ticket.phone}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <CreateTicketModal event={event} isOpen={isCreateTicketModalOpen} onClose={closeCreateTicketModal} />
                    <UploadFileModal event={event} isOpen={isUploadModalOpen} onClose={closeUploadModal} />
                </>
            ) : (
                <div>
                    <h1>Loading...</h1>
                </div>
            )}
        </>
    )
};

export default EventPage;

