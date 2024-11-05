// src/components/Register.js

import React, { useState } from "react";
import axios from "axios";

const API_LINK = "http://localhost:5000/api";

const Register = () => {
  const [user, setUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    userType: "Seeker",
    address: {
      houseNumber: "",
      street: "",
      city: "",
      zip: "",
    },
  });

  const [profile, setProfile] = useState(null);

  const handleOnChange = (e) => {
    setUser((prev) => {
      const updatedUser = { ...prev };

      if (e.target.name.includes("address.")) {
        updatedUser.address = {
          ...updatedUser.address,
          [e.target.name.split(".")[1]]: e.target.value,
        };
      } else {
        updatedUser[e.target.name] = e.target.value;
      }

      return updatedUser;
    });
  };

  const handleUploadImage = (e) => {
    e.preventDefault();
    setProfile(e.target.files[0]);
  };

  const handleChangeUserType = (role) => {
    setUser((prev) => ({
      ...prev,
      userType: role,
    }));
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      var formData = new FormData();

      formData.append("user", JSON.stringify(user));
      formData.append("file", profile);

      const res = await axios.post(`${API_LINK}/users/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 201) {
        console.log(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // console.log(user);

  return (
    <div className=" bg-gray-100 flex justify-center font-sans">
      <div class="rounded-[10px] text-center p-[30px] bg-gray-100 text-black shadow-lg border border-gray-400">
        <h2 class="font-bold text-2xl text-blue-800 mb-1 flex row-auto">
          REGISTER
        </h2>
        <p class="text-xs-mb-[30px] flex row-auto">Welcome to iRenta!</p>
        <div > 
          <form onSubmit={handleSubmit} className="flex flex-col gap-0 items-start"  >
            <label className=" flex flex-row">Username:</label>
            <input type="text" name="username" onChange={handleOnChange}class="w-[100%] px-[20px] py-[8px] rounded-[10px]" />
            <label className=" flex flex-row">Password:</label>
            <input type="password" name="password" onChange={handleOnChange} class="w-[100%] px-[20px] py-[8px] rounded-[10px]"/>
            <label className=" flex flex-row">Email:</label>
            <input type="email" name="email" onChange={handleOnChange}class="w-[100%] px-[20px] py-[8px] rounded-[10px]" />

            <label className=" flex flex-row">First Name:</label>
            <input type="text" name="firstName" onChange={handleOnChange}class="w-[100%] px-[20px] py-[8px] rounded-[10px]" />
            <label className=" flex flex-row">Middle Name:</label>
            <input type="text" name="middleName" onChange={handleOnChange}class="w-[100%] px-[20px] py-[8px] rounded-[10px]" />
            <label className=" flex flex-row">Last Name:</label>
            <input type="text" name="lastName" onChange={handleOnChange}class="w-[100%] px-[20px] py-[8px] rounded-[10px]" />
            <label className=" flex flex-row">Phone Number:</label>
            <input type="number" name="phoneNumber" onChange={handleOnChange} class="w-[100%] px-[20px] py-[8px] rounded-[10px]"/>

            <label className=" flex flex-row">Upload Profile:</label>
            <input type="file" name="profile" onChange={handleUploadImage} />

            {/* Role Selection (Seeker or Owner) */}

            <label>
              <input
                type="radio"
                value="Owners"
                name="userType"
                checked={user.userType === "Seeker"}
                onChange={() => handleChangeUserType("Seeker")}
                class="my-2.5"
              />
              Seeker
            </label>
            <label>
              <input
                type="radio"
                value="Owners"
                name="userType"
                checked={user.userType === "Owner"}
                onChange={() => handleChangeUserType("Owner")}
                
              />
              Owner
            </label>
            
            <div className="flex flex-col gap-2 items-start">
              {user.userType === "Owner" && (
                <>
                  <h3>Address:</h3>
                  <input
                    type="text"
                    placeholder="House Number"
                    name="address.houseNumber"
                    onChange={handleOnChange}
                    class="w-[100%] h-[100%] px-[20px] py-[10px] rounded-[10px]" 
                  />
                  <input
                    type="text"
                    placeholder="Street"
                    name="address.street"
                    onChange={handleOnChange}
                    class="w-[100%] px-[20px] py-[10px] rounded-[10px]" 
                  />
                  <input
                    type="text"
                    placeholder="City"
                    name="address.city"
                    onChange={handleOnChange}
                    class="w-[100%] px-[20px] py-[10px] rounded-[10px]" 
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    name="address.zip"
                    onChange={handleOnChange}
                    class="w-[100%] px-[20px] py-[10px] rounded-[10px]" 
                  />
                </>
              )}
            </div>
            <button type="submit" class="my-[10px] w-[100%] px-[20px] py-[10px] rounded-[10px] bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
