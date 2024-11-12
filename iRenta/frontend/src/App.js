// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import PrivateRoutes from './components/PrivateRoutes.js';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';




const App = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route element={<PrivateRoutes/>}>  {/*protected pages */}
                        <Route path="/chat" element={<Chat />} />
                    </Route>

                </Routes>
            </Router>
            <ToastContainer />
        </>
    );
};

export default App;
