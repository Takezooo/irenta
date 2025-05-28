// src/components/Register.js
import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

const API_LINK = "https://irenta-production.up.railway.app/api";

const Register = () => {

  const navigate = useNavigate();
  const location = useLocation();
  
    // Populate form data on component load if location state has values
    const [user, setUser] = useState({
      email: location.state?.email || "",
      firstName: location.state?.firstName || "",
      lastName: location.state?.lastName || "",
      middleName: "",
      birthDate: "",
      gender: "Male",
      phoneNumber: "",
      userType: "Seeker",
      address: {
        houseNumber: "",
        street: "",
        city: "",
        zip: "",
      },
    });

  // useEffect(() => {
  //   console.log("User state updated:", user);
  // }, [user]);
  

  const [profile, setProfile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputCorrectness = async (user) => {
    try {
      if (user.password.length >= 8) {
        return true;
      }else { 
        toast.error("Password length must be 8");
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  };

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
      console.log(updatedUser);
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

      const isCorrect = await handleInputCorrectness(user); // returns true or false depending on fields value

      if (isCorrect){ // check fields if information is correct
        const res = await axios.post(`${API_LINK}/users/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        if (res.status === 200) {
          toast.success("Succesful");
          navigate("/login");
          console.log(res.data);
        }
      } 
    } catch (err) {
      toast.error(`Error: ${err.message}`);
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gray-100 flex justify-center items-center flex-col font-sans">
      <div className="rounded-[10px] w-[80%] sm:w-10/12 md:w-8/12 lg:w-6/12 2xl:w-4/12 h-fit text-center p-[24px] bg-gray-100 text-black shadow-lg border border-gray-400">
        <h2 className="font-extrabold text-2xl text-blue-800 mb-1">SIGN UP</h2>
        <p className="text-xs mb-[20px]">Create an account.</p>
        <div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-1 items-start"
            method="POST"
          >
            <div className="w-full flex gap-2 justify-between">
              <div>
                <label className="ml-1 text-sm font-medium flex flex-row text-blue-800">
                  First Name:
                </label>
                <input
                  type="text"
                  placeholder="John"
                  name="firstName"
                  value={user.firstName}
                  onChange={handleOnChange}
                  className="w-full px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label className="ml-1 text-sm font-medium flex flex-row text-blue-800">
                  Last Name:
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  name="lastName"
                  value={user.lastName}
                  onChange={handleOnChange}
                  className="w-full px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
                />
              </div>
              <div>
                <label className="ml-1 text-sm font-medium flex flex-row text-blue-800">
                  MI:
                </label>
                <input
                  type="text"
                  placeholder="B."
                  name="middleName"
                  onChange={handleOnChange}
                  className="w-14 text-center py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
                />
              </div>
            </div>
            <label className="ml-1 mt-1 text-sm font-medium flex flex-row text-blue-800">
              Birth Date:
            </label>
            <input
              type="date"
              placeholder="MM/DD/YYYY"
              name="birthDate"
              onChange={handleOnChange}
              className="focus:text-black text-gray-400 w-full px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300 cursor-pointer"
            />
            <label className="ml-1 mt-1 text-sm font-medium flex flex-row text-blue-800">
              Gender:
            </label>
            <select
              name="gender"
              onChange={handleOnChange}
              value={user.gender}
              className="focus:text-black w-full px-[20px] py-[10px] rounded-lg border text-gray-400 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300 cursor-pointer"
            >
              <option selected>Please choose</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <label className="ml-1 mt-1 text-sm font-medium flex flex-row text-blue-800">
              Phone Number:
            </label>
            <input
              type="tel"
              placeholder="09XXXXXXXXX"
              name="phoneNumber"
              onChange={handleOnChange}
              aria-describedby="helper-text-explanation"
              className="w-full px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
            />
            <p id="helper-text-explanation" class="px-[20px] mt-1 text-sm text-gray-500 dark:text-gray-400">Select a phone number that matches the format. Must be in 11 digits.</p>
            <hr className="w-full my-2"></hr>
            <label className="ml-1 text-sm font-medium flex flex-row text-blue-800">
              Username:
            </label>
            <input
              type="text"
              placeholder="JohnDoe123"
              name="username"
              onChange={handleOnChange}
              className="w-full px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
            />
            <label className="ml-1 mt-1 text-sm font-medium flex flex-row text-blue-800">
              Email:
            </label>
            <input
              type="email"
              placeholder="johndoe@email.com"
              name="email"
              value={user.email}
              onChange={handleOnChange}
              className="w-full px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
            />
            <label className="ml-1 mt-1 text-sm font-medium flex flex-row text-blue-800">
              Password:
            </label>
            <input
              type="password"
              placeholder="•••••••••"
              name="password"
              onChange={handleOnChange}
              className="w-full px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
            />
            <hr className="w-full my-2"></hr>
            <label className=" ml-1 text-sm font-medium flex flex-row text-blue-800">
              Upload Profile:
            </label>
            <input
              className="file:outline-none file:border-none file:py-2 file:cursor-pointer file:bg-blue-800 file:hover:bg-blue-600 file:text-white file:duration-300
              block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-gray-200 focus:outline-none"
              type="file"
              name="profile"
              accept=".png, .jpg, .jpeg"
              onChange={handleUploadImage}
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}

            <hr className="w-full mt-2"></hr>
            {/* Role Selection (Seeker or Owner) */}
            <div className="w-full flex gap-0 mx-auto">
              <div className="w-full flex justify-around mt-5">
                <div className="flex items-center border border-gray-300 rounded-tl-lg rounded-bl-lg w-full hover:bg-gray-300 duration-300">
                  <input
                    id="bordered-radio-1"
                    type="radio"
                    value="Owners"
                    name="userType"
                    placeholder="Seeker"
                    checked={user.userType === "Seeker"}
                    onChange={() => handleChangeUserType("Seeker")}
                    className="peer hidden"
                  />
                  <label
                    for="bordered-radio-1"
                    className="w-full px-8 py-2 text-sm font-medium peer-checked:text-white rounded-tl-lg rounded-bl-lg peer-checked:bg-blue-800"
                  >
                    Seeker
                  </label>
                </div>
                <div className="flex items-center border border-gray-300 rounded-se-lg rounded-br-lg w-full hover:bg-gray-300 duration-300">
                  <input
                    id="bordered-radio-2"
                    type="radio"
                    value="Owners"
                    name="userType"
                    checked={user.userType === "Owner"}
                    onChange={() => handleChangeUserType("Owner")}
                    className="peer hidden"
                  />
                  <label
                    for="bordered-radio-2"
                    className="w-full px-8 py-2 text-sm font-medium peer-checked:text-white rounded-se-lg rounded-br-lg peer-checked:bg-blue-800"
                  >
                    Owner
                  </label>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {user.userType === "Owner" && (
                <>
                  <div>
                    <h3 className="ml-1 mt-2 text-sm font-medium flex flex-row text-blue-800">
                      Address:
                    </h3>
                  </div>
                  <div>
                    <div className="flex gap-2 justify-center mb-2">
                      <input
                        type="text"
                        placeholder="House No."
                        name="address.houseNumber"
                        onChange={handleOnChange}
                        className="w-[50%] px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
                      />
                      <input
                        type="text"
                        placeholder="Street"
                        name="address.street"
                        onChange={handleOnChange}
                        className="w-[50%] px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
                      />
                    </div>
                    <div className="flex gap-2 justify-center mb-2">
                      <input
                        type="text"
                        placeholder="City"
                        name="address.city"
                        onChange={handleOnChange}
                        className="w-3/4 px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
                      />
                      <input
                        type="text"
                        placeholder="ZIP Code"
                        name="address.zip"
                        onChange={handleOnChange}
                        className="w-1/4 px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="mt-[10px] w-[100%] px-[20px] py-[10px] rounded-md bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300"
            >
              Create an Account
            </button>
          </form>
        </div>
      </div>
      <Link to="/login">
        <h3 className="mt-[10px] text-sm">
          Already have an account?{" "}
          <span className="text-blue-600 hover:underline font-bold">
            Log In
          </span>
        </h3>
      </Link>
    </div>
  );
};

export default Register;