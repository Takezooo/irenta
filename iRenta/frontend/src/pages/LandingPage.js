// src/components/LandingPage.js

import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Topbar from "../components/global/Topbar.js";
import { Footer } from "../components/global/Footer.js";
import { AuthContext } from "../global/contexts/AuthContext.js";
import { fetchListings } from "../api/Listings.js";
import { useNavigate } from "react-router-dom"; // Import React Router hook
import BrowseListing from "./BrowseListing.js";

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchListings();
      setListings(data); // assuming fetchListings returns an array
    };
  
    fetchData();
  }, []);

  const navigate = useNavigate(); // React Router navigation hook

  const handleBrowseListing = () => {
      navigate("/browse-listing"); // Route to the Request Visit Page
  };

  const handleClick = (property) => {
    navigate("/view-listing", { state: property });
  };

  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div>
      <Topbar />

      <div className="mx-auto mt-36 flex align-center flex-col p-5 rounded-xl w-[90%] from-blue-950 bg-gradient-to-r to-gray-800 overflow-hidden">
        {/* <div className="absolute z-[-1] w-full h-full overflow-hidden">
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/b/b4/Makati_City_Lights2_%28Jopet_Sy%29_-_Flickr.jpg"
                        className="w-full h-full object-cover brightness-75"
                        alt="Metro Manila City Lights"
                    /> 
                </div> */}
        <h1 className="font-extrabold text-6xl mb-2 text-gray-100 sm:text-7xl">
          WELCOME TO <br></br>iRENTA
        </h1>

        {/* Conditionally Render Buttons Based on User Role */}
        {user ? (
          <>
            {user.userType === "Owner" && (
              <Link to="/owner-dashboard">
                <button className="w-[100%] px-[24px] py-[10px] rounded-md bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300">
                  Manage Your Listings
                </button>
              </Link>
            )}
          </>
        ) : (
          <>
            <p className="text-m text-white mb-[20px]">
              Please choose an option to continue.
            </p>
            <div className="flex flex-row gap-4">
              <Link to="/login">
                <button className="w-[100%] px-[24px] py-[10px] rounded-md bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300">
                  Log in
                </button>
              </Link>
              <Link to="/register">
                <button className="w-[100%] px-[24px] py-[10px] rounded-md bg-gray-400 bg-opacity-30 text-white hover:bg-gray-400 transition ease-in duration-300">
                  Register
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
      <div className="mx-auto flex align-center flex-col rounded-xl mt-16 w-[90%]">
        <div className="flex flex-row w-full items-center justify-between">
          <h2 className="text-xl font-bold mb-4">Dormitories</h2>
          <button onClick={handleBrowseListing} className="mt-4 inline-block text-black underline">
            See more  
          </button>
        </div>
        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow-md hover:bg-gray-300"
          >
            <FaChevronLeft />
          </button>
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-hidden space-x-4 px-10"
          >
            {listings.map((property) => (
              <div
                key={property._id}
                className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md border p-4"
                onClick={() => handleClick(property)}
              >
                <div className="h-40 bg-gray-200 rounded-md mb-4"></div>{" "}
                {/* Placeholder for image */}
                <h3 className="text-lg font-semibold">{property.title}</h3>
                <p className="text-gray-500 text-sm">{property.description}</p>
                <p className="text-gray-700 mt-2 font-bold">{property.price}</p>
              </div>
            ))}
          </div>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-full shadow-md hover:bg-gray-300"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="my-36 bg-gradient-to-r from-blue-950 to-gray-900 text-white flex items-center justify-evenly py-14 px-24 relative">
        <div className="h-28 w-28 p-2 bg-gray-100 rounded-lg flex items-center justify-center shadow-md mr-6">
          <img
            src="../assets/images/iRenta.png"
            className="h-full"
            alt="iRenta Logo"
          />
        </div>
        <div className="w-[40%]">
          <div>
            <h3 className="text-3xl font-bold">iRenta</h3>
          </div>
          <div className="bg-gray-300 p-6 mt-2 rounded-xl text-black text-wrap">
            <p className="mt-2 text-sm">
              This is a placeholder description for the additional div. It
              includes a brief overview and is styled for aesthetic alignment.
              This is a placeholder description for the additional div. It
              includes a brief overview and is styled for aesthetic alignment.
              This is a placeholder description for the additional div. It
              includes a brief overview and is styled for aesthetic alignment.
              This is a placeholder description for the additional div. It
              includes a brief overview and is styled for aesthetic alignment.
              This is a placeholder description for the additional div. It
              includes a brief overview and is styled for aesthetic alignment.
            </p>
            <a
              className="mt-4 inline-block text-black underline">
              See more
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;