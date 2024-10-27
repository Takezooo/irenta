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
    <div>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input type="text" name="username" onChange={handleOnChange} />
        <label>Password:</label>
        <input type="password" name="password" onChange={handleOnChange} />
        <label>Email:</label>
        <input type="email" name="email" onChange={handleOnChange} />

        <label>First Name:</label>
        <input type="text" name="firstName" onChange={handleOnChange} />
        <label>Middle Name:</label>
        <input type="text" name="middleName" onChange={handleOnChange} />
        <label>Last Name:</label>
        <input type="text" name="lastName" onChange={handleOnChange} />
        <label>Phone Number:</label>
        <input type="number" name="phoneNumber" onChange={handleOnChange} />

        <label>Upload Profile:</label>
        <input type="file" name="profile" onChange={handleUploadImage} />

        {/* Role Selection (Seeker or Owner) */}

        <label>
          <input
            type="radio"
            value="Owners"
            name="userType"
            checked={user.userType === "Seeker"}
            onChange={() => handleChangeUserType("Seeker")}
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

        {user.userType === "Owner" && (
          <>
            <h3>Address</h3>
            <input
              type="text"
              placeholder="House Number"
              name="address.houseNumber"
              onChange={handleOnChange}
            />
            <input
              type="text"
              placeholder="Street"
              name="address.street"
              onChange={handleOnChange}
            />
            <input
              type="text"
              placeholder="City"
              name="address.city"
              onChange={handleOnChange}
            />
            <input
              type="text"
              placeholder="ZIP Code"
              name="address.zip"
              onChange={handleOnChange}
            />
          </>
        )}

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
