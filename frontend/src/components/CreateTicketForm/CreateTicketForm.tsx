import * as React from 'react';
import {LongEvent} from "../../model/Event";
import {CreateTicket} from "../../model/Ticket";
import {createTicket} from "../../services/TicketService";

type Props = {
    event: LongEvent;
}

const CreateTicketForm: React.FC<Props> = ({event}) => {
    const [formData, setFormData] = React.useState<CreateTicket>({
        uniqueCode: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        email: "",
        phone: "",
        address: "",
        other: "",

        ticketTypeId: event.ticketTypes[0].id
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createTicket(event.id, formData).then(() => {
            console.log("Ticket created");
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <h2>Ticket details</h2>
                <label>
                    Ticket code:
                    <input type="text" name="uniqueCode" value={formData.uniqueCode} onChange={handleChange}/>
                </label>
                <label>
                    Ticket type:
                    <select name="ticketTypeId" value={formData.ticketTypeId} onChange={handleSelectChange}>
                        {event.ticketTypes.map(ticketType => (
                            <option key={ticketType.id} value={ticketType.id}>{ticketType.name}</option>
                        ))}
                    </select>
                </label>

                <h2>Participant details</h2>
                <label>
                    First name:
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}/>
                </label>
                <label>
                    Last name:
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}/>
                </label>
                <label>
                    Date of birth:
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}/>
                </label>
                <label>
                    Email:
                    <input type="email" name="email" value={formData.email} onChange={handleChange}/>
                </label>
                <label>
                    Phone:
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}/>
                </label>
                <label>
                    Address:
                    <input type="text" name="address" value={formData.address} onChange={handleChange}/>
                </label>
                <label>
                    Other:
                    <textarea name="other" value={formData.other} onChange={handleTextareaChange}/>
                </label>

                <br/>
                <button type="submit">Create ticket</button>
            </form>
        </>
    )
};

export default CreateTicketForm;