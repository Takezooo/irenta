// src/components/LandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="h-screen flex justify-center items-start text-white flex-col from-black bg-gradient-to-r">
            <img
                src='https://upload.wikimedia.org/wikipedia/commons/b/b4/Makati_City_Lights2_%28Jopet_Sy%29_-_Flickr.jpg'
                class="absolute z-[-1] h-full w-full bg-cover brightness-75"    
                alt='Metro Manila City Lights'
            />
            <div class="ml-[5%]">
                <h1 class="font-extrabold text-7xl mb-2 text-gray-100">WELCOME TO iRENTA</h1>
                <p class="text-sm mb-[20px]">Please choose an option to continue</p>
                    {/* <hr class="my-[20px] border border-gray-500 w-1/2"></hr> */}
                <div class="flex flex-row gap-4">
                    <Link to="/login">
                        <button class="w-[100%] px-[24px] py-[10px] rounded-[10px] bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300">Log in</button>
                    </Link>
                    <Link to="/register">
                        <button class="w-[100%] px-[24px] py-[10px] rounded-[10px] text-black bg-gray-200 hover:bg-gray-400 transition ease-in duration-300">Register</button>
                    </Link>
                </div>
            </div>
        </div>    
    );
};

export default LandingPage;
