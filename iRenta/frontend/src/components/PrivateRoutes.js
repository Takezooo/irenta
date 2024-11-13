import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../config/authContext.js';

const PrivateRoutes = () => {
    const { user, loading } = useContext(AuthContext);
    const token = localStorage.getItem('token');

    console.log('Token in PrivateRoutes:', token);
    console.log('User in PrivateRoutes:', user);

    if (loading) return <div>Loading...</div>;

    return token && user ? <Outlet /> : <Navigate to="/login" />;
};

  export default PrivateRoutes;