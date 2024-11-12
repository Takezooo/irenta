
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { client, databases, AW_DB, AW_COL } from "../config/appwriteConfig.js";
import { ID, Query } from "appwrite";

const Chat = () => {

    const [messages, setMessages] = useState([]);
    const [messageBody, setMessageBody] = useState("");

    useEffect (() => {
        getMessages();

        const unsubscribe = client.subscribe(`databases.${AW_DB}.collections.${AW_COL}.documents`, response => {

            if(response.events.includes("databases.*.collections.*.documents.*.create")) {
                console.log("A MESSAGE WAS CREATED");
                setMessages(prevState => [...prevState, response.payload]);
            }  

        });

        return () => {
            unsubscribe()
        }

    }, []);

    const getMessages = async () => {
        const response = await databases.listDocuments(
            AW_DB, 
            AW_COL,
            [
                Query.orderAsc(`$createdAt`), // ascending order
                Query.limit(5) // limit visible messages
            ]
        );
        setMessages(response.documents);
    } 
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        let payload = {
            body: messageBody,
        }

        let response = await databases.createDocument(
            AW_DB,
            AW_COL, 
            ID.unique(), 
            payload
        );

        //setMessages(prevState => [...messages, response]); // add new messages at the end of the current list

        setMessageBody("");

    }

    return (
        <div className='h-screen bg-gray-100 flex justify-center items-center flex-col font-sans'>
            <div>
                {messages.map(message => (
                    <div key={message.$id}>
                        <div>
                            <span>{message.body}</span>
                        </div>
                        <div>
                            <span>{message.$createdAt}</span>
                        </div>
                    </div>
                ))}
            </div>

            <form 
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                id='message--form'
                onSubmit={handleSubmit}
            >
                <div>
                    <textarea
                        required
                        maxLength="1000"
                        placeholder='Message'
                        onChange={(e) => {setMessageBody(e.target.value)}}
                        value={messageBody}
                    >
                    </textarea>
                </div>

                <div>
                    <input 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        type='submit' 
                        value="Send"
                    />
                </div>
            </form>
        </div>
    );
};

export default Chat;