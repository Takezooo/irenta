// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './components/Chat';
import { ToastContainer } from 'react-toastify';
import OwnerDashboard from './scenes/dashboard/OwnerDashboard';

const App = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/ownerdashboard" element={<OwnerDashboard />} />
                </Routes>
            </Router>
            <ToastContainer />
        </>
    );
};

export default App;
