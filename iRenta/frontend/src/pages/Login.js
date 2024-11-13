import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import { Link } from 'react-router-dom';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';

const API_LINK = "http://localhost:5000/api";

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Google login handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_LINK}/users/login`, { username, password });
            
            // Store the token in localStorage
            localStorage.setItem('token', response.data.token);
            console.log('Stored token:', localStorage.getItem('token'));
    
            toast.success('Login successful');
    
            // Introduce a slight delay to ensure the token is stored
            setTimeout(() => {
                navigate('/chat');
            }, 100); // Adjust the delay if needed
        } catch (err) {
            toast.error(`Login failed: ${err}`);
            console.error("Login failed:", err);
        }
    };
    
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        const idToken = credentialResponse.credential;
    
        try {
            const response = await axios.post(`${API_LINK}/users/google-login/`, { idToken });
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("username", response.data.username);
    
            toast.success(`Google Login successful, ${response.data.username}`);
            setTimeout(() => navigate('/chat'), 100);
        } catch (err) {
            toast.error(`Google Login failed: ${err}`);
            console.error("Google Login failed:", err);
    
            if (err.response && err.response.data && err.response.data.unregistered) {
                const userDetails = err.response.data.userDetails;
                navigate("/register", { state: userDetails });
            }
        }
    };    

    return (
        <div className="h-screen bg-gray-100 flex justify-center items-center flex-col font-sans">
            <div className=" rounded-[10px] w-[80%] sm:w-8/12 md:w-6/12 lg:w-4/12 xl:w-3/12 2xl:w-1/6 h-fit text-center p-[24px] bg-gray-100 text-black shadow-lg border border-gray-400">
                <h2 className="font-extrabold text-2xl text-blue-800 mb-1">LOGIN</h2>
                <p className="text-xs mb-[30px]">Welcome to iRenta!</p>
                <form onSubmit={handleSubmit} className="gap-4 flex justify-center items-center flex-col">
                    <input className="w-full px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        className="w-full px-[20px] py-[10px] rounded-md mb-1 border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="my-[10px] w-[100%] px-[20px] py-[10px] rounded-md bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300">Log in</button>
                                    <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                        console.log('Google Login Failed');
                    }}
                />
</form>
            </div>
            <Link to="/register">
                <h3 className="mt-[10px] text-sm">New to iRenta? <span className="text-blue-600 hover:underline font-bold">Register</span></h3>
            </Link>
        </div>
    );
};

export default Login;
