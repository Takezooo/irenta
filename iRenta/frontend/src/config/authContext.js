import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_LINK = "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        // Add a delay to ensure the token is stored before accessing
        await new Promise((resolve) => setTimeout(resolve, 200)); // Delay of 200ms

        const token = localStorage.getItem('token');
        console.log('Token from localStorage in checkAuth:', token);

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_LINK}/users/auth-check`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Auth-check response:', response.data);

            if (response.data && response.data.user) {
                setUser(response.data.user);
                console.error('user found in response:', response.data);
            } else {
                console.error('No user found in response:', response.data);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed:', error.response?.data || error.message);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
