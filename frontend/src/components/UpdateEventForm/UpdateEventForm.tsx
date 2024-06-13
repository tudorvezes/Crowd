import * as React from "react";
import { useEffect, useState } from "react";
import { FullEvent, UpdateEvent } from "../../model/Event";
import { TicketType } from "../../model/TicketType";
import './UpdateEventForm.css';
import addIcon from '../../assets/icons/add_FILL0_wght600_GRAD0_opsz40.svg';
import deleteIcon from '../../assets/icons/remove_24dp_FILL0_wght600_GRAD0_opsz40.svg';
import { toast } from "react-toastify";
import {deleteEvent, updateEvent} from "../../services/EventService";
import {useNavigate} from "react-router-dom";

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

type Props = {
    eventModel: FullEvent;
}

const UpdateEventForm: React.FC<Props> = ({ eventModel }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<UpdateEvent>({
        id: 0,
        name: '',
        startDate: '',
        endDate: '',
        capacity: 0,
        overselling: false,
        superAdmins: [],
        admins: [],
        scanners: [],
        existingTicketTypes: [],
        newTicketTypes: []
    });
    const [capacity, setCapacity] = useState('');
    const [superAdmins, setSuperAdmins] = useState('');
    const [admins, setAdmins] = useState('');
    const [scanners, setScanners] = useState('');

    const [toDeleteTicketTypes, setToDeleteTicketTypes] = useState<TicketType[]>([]);

    useEffect(() => {
        if (eventModel) {
            const startDate = eventModel.startDate.split('T')[0];
            const endDate = eventModel.endDate.split('T')[0];

            setFormData({
                id: eventModel.id,
                name: eventModel.name,
                startDate: startDate,
                endDate: endDate,
                capacity: eventModel.capacity,
                overselling: eventModel.overselling,
                superAdmins: eventModel.superAdmins,
                admins: eventModel.admins,
                scanners: eventModel.scanners,
                existingTicketTypes: eventModel.ticketTypes,
                newTicketTypes: []
            });
            setSuperAdmins(eventModel.superAdmins.join(','));
            setAdmins(eventModel.admins.join(','));
            setScanners(eventModel.scanners.join(','));
            setCapacity(eventModel.capacity.toString());
        }
    }, [eventModel]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prevState => ({
                ...prevState,
                [name]: checked,
            }));
        } else if (name === 'capacity') {
            if (parseInt(value) <= 0) {
                return;
            }
            setCapacity(value);
            setFormData(prevState => ({
                ...prevState,
                [name]: parseInt(value),
            }));
        } else if (name === 'superAdmins' || name === 'admins' || name === 'scanners') {
            const sanitizedValue = value.replace(/[^a-z,0-9_]/g, '');
            if (name === 'superAdmins') {
                setSuperAdmins(sanitizedValue);
            } else if (name === 'admins') {
                setAdmins(sanitizedValue);
            } else {
                setScanners(sanitizedValue);
            }

            setFormData(prevState => ({
                ...prevState,
                [name]: sanitizedValue.split(','),
            }));
        } else {
            setFormData(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleExistingTicketTypeChange = (e: React.ChangeEvent<HTMLInputElement>, ticketType: TicketType) => {
        const { name, value, type } = e.target;
        if (type === 'number' && parseInt(value) <= 0) {
            return;
        }
        setFormData(prevState => ({
            ...prevState,
            existingTicketTypes: prevState.existingTicketTypes.map(tt => {
                if (tt.id === ticketType.id) {
                    return {
                        ...tt,
                        [name]: type === 'number' ? parseInt(value) : value,
                    };
                }
                return tt;
            }),
        }));
    };

    const handleExistingTicketTypeCurrencyChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const currency = e.target.value;
        setFormData(prevState => ({
            ...prevState,
            existingTicketTypes: prevState.existingTicketTypes.map((tt, i) => {
                if (i === index) {
                    return {
                        ...tt,
                        currency: currency,
                    };
                }
                return tt;
            }),
        }));
    };

    const handleDeleteExistingTicketType = (ticketType: TicketType) => {
        setToDeleteTicketTypes([...toDeleteTicketTypes, ticketType]);
        setFormData(prevState => ({
            ...prevState,
            existingTicketTypes: prevState.existingTicketTypes.filter(tt => tt.id !== ticketType.id),
        }));
    };

    const handleUndoDeleteExistingTicketType = (ticketType: TicketType) => {
        setToDeleteTicketTypes(toDeleteTicketTypes.filter(tt => tt.id !== ticketType.id));
        setFormData(prevState => ({
            ...prevState,
            existingTicketTypes: [...prevState.existingTicketTypes, ticketType],
        }));
    };

    const handleNewTicketTypeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { name, value, type } = e.target;
        if (type === 'number' && parseInt(value) <= 0) {
            return;
        }
        setFormData(prevState => ({
            ...prevState,
            newTicketTypes: prevState.newTicketTypes.map((tt, i) => {
                if (i === index) {
                    return {
                        ...tt,
                        [name]: type === 'number' ? parseInt(value) : value,
                    };
                }
                return tt;
            }),
        }));
    };

    const handleNewTicketTypeCurrencyChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const currency = e.target.value;
        setFormData(prevState => ({
            ...prevState,
            newTicketTypes: prevState.newTicketTypes.map((tt, i) => {
                if (i === index) {
                    return {
                        ...tt,
                        currency: currency,
                    };
                }
                return tt;
            }),
        }));
    }

    const handleAddNewTicketType = () => {
        setFormData(prevState => ({
            ...prevState,
            newTicketTypes: [...prevState.newTicketTypes, { name: '', price: 0, currency: currencies[0], quantity: 0 }],
        }));
    };

    const handleDeleteNewTicketType = (index: number) => {
        setFormData(prevState => ({
            ...prevState,
            newTicketTypes: prevState.newTicketTypes.filter((_, i) => i !== index),
        }));
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
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateEvent(formData).then(() => {
            navigate('/event/' + eventModel.uniqueCode);
        });
    }

    const handleDeleteEvent = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        deleteEvent(eventModel.id).then(() => {
            navigate('/events');
        });
    }

    return (
        <div className='form-container'>
            <form className='form' onSubmit={handleSubmit}>
                <div className='form-top'>
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
                            <input className="input-field"
                                   type='text'
                                   name='superAdmins'
                                   value={superAdmins}
                                   style={{ width: '380px' }}
                                   onChange={handleChange}/>
                        </label>
                        <label>
                            <input className="input-field"
                                   type='text'
                                   name='admins'
                                   value={admins}
                                   style={{ width: '380px' }}
                                   onChange={handleChange}/>
                        </label>
                        <label>
                            <input className="input-field"
                                   type='text'
                                   name='scanners'
                                   value={scanners}
                                   style={{ width: '380px' }}
                                   onChange={handleChange}/>
                        </label>
                    </div>
                </div>

                <div className='form-bottom'>
                    <h2>Ticket types</h2>
                    {formData.existingTicketTypes.map((ticketType, index) => (
                        <div key={ticketType.id} className='row-layout'>
                            <label>
                                <input
                                    className="input-field"
                                    type="text"
                                    name="name"
                                    placeholder="Ticket type name"
                                    value={ticketType.name}
                                    onChange={(e) => handleExistingTicketTypeChange(e, ticketType)}
                                />
                            </label>
                            <label>
                                <input
                                    className="input-field"
                                    type="number"
                                    name="price"
                                    placeholder="Price"
                                    value={ticketType.price}
                                    onChange={(e) => handleExistingTicketTypeChange(e, ticketType)}
                                />
                            </label>
                            <label>
                                <input
                                    className="input-field"
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={ticketType.quantity}
                                    onChange={(e) => handleExistingTicketTypeChange(e, ticketType)}
                                />
                            </label>
                            <label>
                                <select
                                    className="select-field"
                                    name="currency"
                                    value={ticketType.currency}
                                    onChange={(e) => handleExistingTicketTypeCurrencyChange(index, e)}
                                >
                                    {currencies.map(currency => (
                                        <option key={currency} value={currency}>{currency}</option>
                                    ))}
                                </select>
                            </label>
                            <button type="button" className='icon-button' onClick={() => handleDeleteExistingTicketType(ticketType)}>
                                <img src={deleteIcon} alt="Delete ticket type" />
                            </button>
                        </div>
                    ))}
                    {toDeleteTicketTypes.map((ticketType, index) => (
                        <div key={ticketType.id} className='row-layout'>
                            <p>{ticketType.name} (deleted)</p>
                            <button type="button" className='icon-button' onClick={() => handleUndoDeleteExistingTicketType(ticketType)}>
                                Undo
                            </button>
                        </div>
                    ))}
                    {formData.newTicketTypes.map((ticketType, index) => (
                        <div key={index} className='row-layout'>
                            <label>
                                <input
                                    className="input-field"
                                    type="text"
                                    name="name"
                                    placeholder="Ticket type name"
                                    value={ticketType.name}
                                    onChange={(e) => handleNewTicketTypeChange(e, index)}
                                />
                            </label>
                            <label>
                                <input
                                    className="input-field"
                                    type="number"
                                    name="price"
                                    placeholder="Price"
                                    value={ticketType.price}
                                    onChange={(e) => handleNewTicketTypeChange(e, index)}
                                />
                            </label>
                            <label>
                                <input
                                    className="input-field"
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={ticketType.quantity}
                                    onChange={(e) => handleNewTicketTypeChange(e, index)}
                                />
                            </label>
                            <label>
                                <select
                                    className="select-field"
                                    name="currency"
                                    value={ticketType.currency}
                                    onChange={(e) => handleNewTicketTypeCurrencyChange(index, e)}
                                >
                                    {currencies.map(currency => (
                                        <option key={currency} value={currency}>{currency}</option>
                                    ))}
                                </select>
                            </label>
                            <button type="button" className='icon-button' onClick={() => handleDeleteNewTicketType(index)}>
                                <img src={deleteIcon} alt="Delete ticket type" />
                            </button>
                        </div>
                    ))}
                    <button type="button" className='icon-button' onClick={handleAddNewTicketType}>
                        <img src={addIcon} alt="Add ticket type" />
                    </button>
                </div>
                <button
                    type="submit"
                    className='black-button'
                    style={{ width: '180px', marginTop: '10px' }}>
                    Update event
                </button>
            </form>

            <button
                className='black-button'
                style={{ width: '180px', marginTop: '10px' }}
                onClick={handleDeleteEvent}>
                Delete event
            </button>
        </div>
    );
};

export default UpdateEventForm;
