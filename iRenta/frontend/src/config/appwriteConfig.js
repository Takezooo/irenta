import React from 'react';
import { Client, Databases, Account } from "appwrite";

export const AW_ENDPOINT = process.env.REACT_APP_APPW_EP; // Appwrite Endpoint
export const AW_PROJID = process.env.REACT_APP_APPW_PROJ_ID; // Appwrite Project ID
export const AW_DB = process.env.REACT_APP_APPW_DB_ID; // Appwrite Database ID
export const AW_COL = process.env.REACT_APP_APPW_COLL_MESS_ID; // Appwrite Collection of Messages ID

export const client = new Client()
    .setEndpoint(AW_ENDPOINT) // Your API Endpoint
    .setProject(AW_PROJID); // Your project ID

export const databases = new Databases(client);
export const account = new Account(client);