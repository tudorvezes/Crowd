import * as React from "react";
import Navbar from "../../components/Navbar/Navbar";
import CreateEventForm from "../../components/CreateEventForm/CreateEventForm";

const CreateEventPage: React.FC = () => {
    return (
        <>
            <Navbar />
            <h1>Create Event</h1>
            <CreateEventForm />
        </>
    )
};

export default CreateEventPage;