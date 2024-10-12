// src/components/LandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Welcome to iRenta</h1>
            <p>Please choose an option to continue</p>
            <Link to="/login">
                <button style={{ margin: '10px', padding: '10px 20px' }}>Login</button>
            </Link>
            <Link to="/register">
                <button style={{ margin: '10px', padding: '10px 20px' }}>Register</button>
            </Link>
        </div>
    );
};

export default LandingPage;
