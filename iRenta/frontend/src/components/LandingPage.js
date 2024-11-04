// src/components/LandingPage.js

import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="h-screen bg-gray-100 flex justify-center items-center">
            <div class="rounded-[10px] h-fit w-fit text-center p-[30px] bg-gray-100 text-black shadow-lg border border-gray-400">
                <h1 class="font-extrabold text-2xl mb-2 text-blue-800">WELCOME TO iRENTA</h1>
                <p class="text-sm">Please choose an option to continue</p>
                <hr class="my-[20px] border border-gray-500"></hr>
                <div class="flex flex-col gap-4">
                    <Link to="/login">
                        <button class="w-[100%] px-[20px] py-[10px] rounded-[10px] bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300">Log in</button>
                    </Link>
                    <Link to="/register">
                        <button class="w-[100%] px-[20px] py-[10px] rounded-[10px] bg-gray-200 hover:bg-gray-400 transition ease-in duration-300">Register</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
