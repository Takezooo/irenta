// src/components/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/users/login", {
              username,
              password,
            });
            // Save token to localStorage or context
            localStorage.setItem("token", response.data.token);
            console.log("Login successful");
          } catch (err) {
            console.error("Login failed:", err);
          }
    };

    return (
        <div className="h-screen bg-gray-100 flex justify-center items-center flex-col font-sans">
            <div className=" rounded-[10px] w-[80%] sm:w-8/12 md:w-6/12 lg:w-4/12 xl:w-3/12 2xl:w-1/6 h-fit text-center p-[24px] bg-gray-100 text-black shadow-lg border border-gray-400">
                <h2 className="font-extrabold text-2xl text-blue-800 mb-1">LOGIN</h2>
                <p className="text-xs mb-[30px]">Welcome to iRenta!</p>
                <form onSubmit={handleSubmit} className="gap-4 flex justify-center items-center flex-col">
                    <input className="w-[100%] px-[20px] py-[10px] rounded-[10px]"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input className="w-[100%] px-[20px] py-[10px] rounded-[10px] mb-1"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="my-[10px] w-[100%] px-[20px] py-[10px] rounded-[10px] bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300">Log in</button>
                </form>
            </div>
            <Link to="/register">
                <h3 className="mt-[10px] text-sm">New to iRenta? <span className="text-blue-600 hover:underline font-bold">Register</span></h3>
            </Link>
        </div>
    );
};

export default Login;
