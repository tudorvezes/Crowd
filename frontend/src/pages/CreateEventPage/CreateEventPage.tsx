import * as React from "react";
import Navbar from "../../components/Navbar/Navbar";
import CreateEventForm from "../../components/CreateEventForm/CreateEventForm";

import '../../App.css';

const CreateEventPage: React.FC = () => {
    return (
        <>
            <Navbar />
            <div className='cl-page-width'>
                <h1>Create an event</h1>
                <CreateEventForm />
            </div>
        </>
    )
};

export default CreateEventPage;