import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import { Link } from 'react-router-dom';
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
            toast.success(`Google Login successful, ${response.data.username}`);
            console.log("Google Login successful", response.data.username);
            navigate("/chat");
    
        } catch (err) {
            toast.error(`Google Login failed:, ${err}`);
            console.error("Google Login failed:", err);
    
            if (err.response && err.response.data && err.response.data.unregistered) {
                const userDetails = err.response.data.userDetails;
                toast.error('Email not registered');
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
            toast.success('Login successful');
            navigate("/chat");
            console.log(response.data.token);
            console.log("Login successful");

          } catch (err) {
            toast.error(`Login failed: ${err}`);
            console.error("Login failed:", err);
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

<<<<<<< HEAD:iRenta/frontend/src/components/Login.js
                    <button type="submit" className="my-[10px] w-[100%] px-[20px] py-[10px] rounded-md bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300">Log in</button>
                    <GoogleLogin 
=======
                    <button type="submit" className="mt-[10px] w-[100%] px-[20px] py-[10px] rounded-md bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300">Log in</button>
                    <hr className="w-full"></hr>
                    <GoogleLogin
>>>>>>> develop:iRenta/frontend/src/pages/Login.js
                    onSuccess={handleGoogleLoginSuccess}
                    onError={() => {
                        console.log('Google Login Failed');
                    }}
<<<<<<< HEAD:iRenta/frontend/src/components/Login.js
                />
            </form>
=======
                    />
</form>
>>>>>>> develop:iRenta/frontend/src/pages/Login.js
            </div>
            <Link to="/register">
                <h3 className="mt-[10px] text-sm">New to iRenta? <span className="text-blue-600 hover:underline font-bold">Sign Up</span></h3>
            </Link>
        </div>
    );
};

export default Login;
