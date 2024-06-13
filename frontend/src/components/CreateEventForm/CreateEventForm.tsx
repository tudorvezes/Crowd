import * as React from 'react';
import { useState } from 'react';
import { CreateEvent } from "../../model/Event";
import { createEvent } from "../../services/EventService";
import { useNavigate } from "react-router-dom";

import './CreateEventForm.css';
import addIcon from '../../assets/icons/add_FILL0_wght600_GRAD0_opsz40.svg';
import deleteIcon from '../../assets/icons/remove_24dp_FILL0_wght600_GRAD0_opsz40.svg';

const currencies: string[] = [
    "RON",
    "USD",
    "EUR",
    "GBP",
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
    const [capacity, setCapacity] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prevState => ({
                ...prevState,
                [name]: checked,
            }));
        } else if (name === 'capacity') {
            if (parseInt(value) <= 0 || isNaN(parseInt(value))) {
                return;
            }
            setCapacity(value);
            setFormData(prevState => ({
                ...prevState,
                [name]: parseInt(value),
            }));
        } else if (name === 'superAdmins' || name === 'admins' || name === 'scanners') {
            const sanitizedValue = value.replace(/[^a-z,0-9_]/g, '');

            const itemsArray = sanitizedValue.split(',').map(item => item.trim());

            setFormData(prevState => ({
                ...prevState,
                [name]: itemsArray,
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
            if (name === 'quantity' && parseInt(value) <= 0) {
                return prevState;
            }
            if (name === 'price' && parseFloat(value) <= 0) {
                return prevState;
            }
            ticketTypes[index] = {
                ...ticketTypes[index],
                [name]: name === 'price' || name === 'quantity' ? parseFloat(value) : value,
            };
            return { ...prevState, ticketTypes };
        });
    };

    const handleTicketTypeCurrencyChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setFormData(prevState => {
            const ticketTypes = [...prevState.ticketTypes];
            ticketTypes[index] = {
                ...ticketTypes[index],
                currency: value,
            };
            return { ...prevState, ticketTypes };
        });
    };

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
        <div className='form-container'>
            <form onSubmit={handleSubmit} className='form'>
                <div className="form-top">
                    <div className="form-top-left">
                        <h2>Event details</h2>
                        <label>
                            <input className="input-field" placeholder='Event name' style={{ width: '340px' }} type="text" name="name" value={formData.name} onChange={handleChange}/>
                        </label>
                        <div className='row-layout'>
                            <label>
                                <input className="input-field" placeholder='Start date' style={{ width: '160px' }} type="date" name="startDate" value={formData.startDate} min={getCurrentDate()} onChange={handleChange}/>
                            </label>
                            <hr/>
                            <label>
                                <input className="input-field" placeholder='End date' style={{ width: '160px' }} type="date" name="endDate" value={formData.endDate} min={getStartDate()} onChange={handleChange}/>
                            </label>
                        </div>
                        <div className='row-layout' style={{ gap: '14px' }}>
                            <label>
                                <input className="input-field" placeholder='Capacity' style={{ width: '160px' }} type="number" name="capacity" value={capacity} onChange={handleChange}/>
                            </label>
                            <label className="check-box">
                                <input type="checkbox" name="overselling" checked={formData.overselling}
                                       onChange={handleChange}/>
                                <span className="checkmark"></span>
                                <p>Allow overselling</p>
                            </label>
                        </div>
                    </div>

                    <div className='form-top-right'>
                        <h2>Permissions</h2>
                        <label>
                            <input className="input-field" placeholder='Other super-admins' style={{ width: '380px' }} type="text" name="superAdmins" value={formData.superAdmins} onChange={handleChange}/>
                        </label>
                        <label>
                            <input className="input-field" placeholder='Other admins' style={{ width: '380px' }} type="text" name="admins" value={formData.admins} onChange={handleChange}/>
                        </label>
                        <label>
                            <input className="input-field" placeholder='Other scanners' style={{ width: '380px' }} type="text" name="scanners" value={formData.scanners} onChange={handleChange}/>
                        </label>
                    </div>
                </div>

                <div className="form-bottom">
                    <h2>Ticket types</h2>
                    {formData.ticketTypes.map((ticketType, index) => (
                        <div key={index} className='row-layout'>
                            <label>
                                <input
                                    className="input-field"
                                    type="text"
                                    name="name"
                                    style={{ width: '240px' }}
                                    placeholder='Ticket type name'
                                    value={ticketType.name}
                                    onChange={(e) => handleTicketTypeChange(index, e)}
                                />
                            </label>
                            <label>
                                <input
                                    className="input-field"
                                    type="number"
                                    name="price"
                                    style={{ width: '140px' }}
                                    placeholder='Price'
                                    value={ticketType.price}
                                    onChange={(e) => handleTicketTypeChange(index, e)}
                                />
                            </label>
                            <label>
                                <select
                                    className="select-field"
                                    name="currency"
                                    value={ticketType.currency}
                                    style={{ width: '100px' }}
                                    onChange={(e) => handleTicketTypeCurrencyChange(index, e)}>
                                    {currencies.map((currency, currencyIndex) => (
                                        <option key={currencyIndex} value={currency}>{currency}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <input
                                    className="input-field"
                                    type="number"
                                    name="quantity"
                                    style={{ width: '140px' }}
                                    placeholder='Quantity'
                                    value={ticketType.quantity}
                                    onChange={(e) => handleTicketTypeChange(index, e)}
                                />
                            </label>
                            {index === 0 ? (
                                <button className='icon-button black' type="button" onClick={handleAddTicketType}>
                                    <img src={addIcon} alt="Add ticket type"/>
                                </button>
                            ) : (
                                <button className='icon-button grey' type="button" onClick={() => handleDeleteTicketType(index)}>
                                    <img src={deleteIcon} alt="Delete ticket type"/>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button className='black-button' type="submit" style={{ width: '180px', marginTop: '10px' }}>Create Event</button>
            </form>
        </div>
    );
};

export default CreateEventForm;
