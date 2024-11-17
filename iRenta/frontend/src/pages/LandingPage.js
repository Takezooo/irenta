// src/components/LandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="h-screen w-screen flex justify-center items-start text-white flex-col from-black bg-gradient-to-r">
            
            <div className="absolute z-[-1] w-full h-full overflow-hidden">
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b4/Makati_City_Lights2_%28Jopet_Sy%29_-_Flickr.jpg"
                    className="w-full h-full object-cover brightness-75"
                    alt="Metro Manila City Lights"
                /> 
            </div>

            <div className="mx-[8%]">
                <h1 className="font-extrabold text-6xl mb-2 text-gray-100 sm:text-7xl">WELCOME TO <br></br>iRENTA</h1>
                <p className="text-m mb-[20px]">Please choose an option to continue.</p>

                <div className="flex flex-row gap-4">
                    <Link to="/login">
                        <button className="w-[100%] px-[24px] py-[10px] rounded-md bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300">Log in</button>
                    </Link>
                    <Link to="/register">
                        <button className="w-[100%] px-[24px] py-[10px] rounded-md bg-gray-400 bg-opacity-30 hover:bg-gray-400 transition ease-in duration-300">Register</button>
                    </Link>
                </div>
            </div>

        </div>    
    );
};

export default LandingPage;