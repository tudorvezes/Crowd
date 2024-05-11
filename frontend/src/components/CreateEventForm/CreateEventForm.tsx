import * as React from 'react';
import {useState} from 'react';
import {CreateEvent} from "../../model/Event";
import {createEvent} from "../../services/EventService";
import {useNavigate} from "react-router-dom";

const currencies: string[] = [
    "USD",
    "EUR",
    "GBP",
    "RON",
    "CAD",
    "AUD",
    "CHF",
    "CNY",
    "SEK",
    "NZD",
];

const CreateEventForm: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<CreateEvent>({
        name: '',
        startDate: '',
        endDate: '',
        capacity: 0,
        overselling: false,
        superAdmins: [],
        admins: [],
        scanners: [],
        ticketTypes: [{ name: '', price: 0, currency: currencies[0], quantity: 0 }],
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prevState => ({
                ...prevState,
                [name]: checked,
            }));
        } else if (name === 'superAdmins' || name === 'admins' || name === 'scanners') {
            setFormData(prevState => ({
                ...prevState,
                [name]: value.split(',').map(item => item.trim()), // Split the input string by comma and trim whitespace
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
    };


    const handleAddTicketType = () => {
        setFormData(prevState => ({
            ...prevState,
            ticketTypes: [...prevState.ticketTypes, { name: '', price: 0, currency: currencies[0], quantity: 0 }],
        }));
    };

    const handleDeleteTicketType = (index: number) => {
        setFormData(prevState => ({
            ...prevState,
            ticketTypes: prevState.ticketTypes.filter((_, i) => i !== index),
        }));
    };

    const handleTicketTypeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => {
            const ticketTypes = [...prevState.ticketTypes];
            if (value!=='' && (name == 'price' || name == 'currency' || name == 'quantity')) {
                ticketTypes[index] = {
                    ...ticketTypes[index],
                    [name]: parseInt(value),
                };
                return { ...prevState, ticketTypes };
            }
            else {
                ticketTypes[index] = {
                    ...ticketTypes[index],
                    [name]: value,
                };
                return { ...prevState, ticketTypes };
            }
        });
    };

    function handleTicketTypeCurrencyChange(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
        const { value } = e.target;
        setFormData(prevState => {
            const ticketTypes = [...prevState.ticketTypes];
            ticketTypes[index] = {
                ...ticketTypes[index],
                currency: value,
            };
            return { ...prevState, ticketTypes };
        });
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Creating event with data:", formData);
        try {
            createEvent(formData).then((event) => {
                if (event) {
                    navigate(`/event/${event.uniqueCode}`);
                }
            });
        } catch (e) {
            console.error("Error creating event:", e);
        }
    };

    const getCurrentDate = (): string => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    };

    const getStartDate = (): string => {
        if (formData.startDate === '') {
            return getCurrentDate();
        }
        return formData.startDate;
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="create-event-form-right">
                    <h2>Event details</h2>
                    <label>
                        Event Name:
                        <input type="text" name="name" value={formData.name} onChange={handleChange}/>
                    </label>
                    <br/>
                    <label>
                        Start Date:
                        <input type="date" name="startDate" value={formData.startDate} min={getCurrentDate()} onChange={handleChange}/>
                    </label>
                    <label>
                        End Date:
                        <input type="date" name="endDate" value={formData.endDate} min={getStartDate()} onChange={handleChange}/>
                    </label>
                    <br/>
                    <label>
                        Capacity:
                        <input type="number" name="capacity" value={formData.capacity} onChange={handleChange}/>
                    </label>
                    <label>
                        Allow overselling:
                        <input type="checkbox" name="overselling" checked={formData.overselling} onChange={handleChange}/>
                    </label>

                    <h2>Permissions</h2>
                    <label>
                        Other super admins:
                        <input type="text" name="superAdmins" value={formData.superAdmins} onChange={handleChange}/>
                    </label>
                    <br/>
                    <label>
                        Other admins:
                        <input type="text" name="admins" value={formData.admins} onChange={handleChange}/>
                    </label>
                    <br/>
                    <label>
                        Other scanners:
                        <input type="text" name="scanners" value={formData.scanners} onChange={handleChange}/>
                    </label>
                </div>

                <div className="create-event-form-left">
                    <h2>Ticket types</h2>
                    {formData.ticketTypes.map((ticketType, index) => (
                        <div key={index}>
                            <label>
                                Ticket name:
                                <input
                                    type="text"
                                    name="name"
                                    value={ticketType.name}
                                    onChange={(e) => handleTicketTypeChange(index, e)}
                                />
                            </label>
                            <label>
                                Price:
                                <input
                                    type="number"
                                    name="price"
                                    value={ticketType.price}
                                    onChange={(e) => handleTicketTypeChange(index, e)}
                                />
                            </label>
                            <label>
                                Currency:
                                <select
                                    name="currency"
                                    value={ticketType.currency}
                                    onChange={(e) => handleTicketTypeCurrencyChange(index, e)}>
                                    {currencies.map((currency, currencyIndex) => (
                                        <option key={currencyIndex} value={currency}>{currency}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Quantity:
                                <input
                                    type="number"
                                    name="quantity"
                                    value={ticketType.quantity}
                                    onChange={(e) => handleTicketTypeChange(index, e)}
                                />
                            </label>
                            {index !== 0 && ( // Render delete button for all ticket types except the first one
                                <button type="button" onClick={() => handleDeleteTicketType(index)}>Delete</button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={handleAddTicketType}>Add ticket type</button>
                </div>

                <button type="submit">Create Event</button>
            </form>
        </>
    );
};

export default CreateEventForm;
