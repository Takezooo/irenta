import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Google login handler
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        const idToken = credentialResponse.credential;
    
        try {
            const response = await axios.post("http://localhost:5000/api/users/google-login", {
                idToken,
            });
    
            // Handle successful login
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("username", response.data.username);
            console.log("Google Login successful", response.data.username);
    
        } catch (err) {
            console.error("Google Login failed:", err);
    
            if (err.response && err.response.data && err.response.data.unregistered) {
                const userDetails = err.response.data.userDetails;
                navigate("/register", { state: userDetails });
                console.log(userDetails);
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/users/login", {
              username,
              password,
            });
            // Save token to localStorage or context
            localStorage.setItem("token", response.data.token);
            console.log(response.data.token);
            console.log("Login successful");
          } catch (err) {
            console.error("Login failed:", err);
          }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                    <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                        console.log('Google Login Failed');
                    }}
                />
            </form>
        </div>
    );
};

export default Login;
