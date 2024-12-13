import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { loginUser, googleLogin } from "../api/Auth.js";
import { AuthContext } from "../global/contexts/AuthContext.js";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // From context
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential; // Extract only the credential

    try {
      console.log("Google ID token received:", idToken);
      const response = await googleLogin(idToken, navigate); // Pass only the token
      console.log("Unregistered?:", response.unregistered);
      console.log("Google login result:", response);

      if (response.unregistered) {
        // If user is unregistered, navigate to registration page
        toast.error("Email not registered");
        navigate("/register", { state: response.userDetails });
        return;
      }
      // Handle successful login
      toast.success("Google Login successful");
      console.log("User successfully logged in:", response.user);
      // Save user and token in AuthContext
      const { token, user } = response;
      login(user, token);
      // Redirect based on user role
      navigateBasedOnRole(response.user.userType);
      
    } catch (err) {
      toast.error("Google Login failed");
      console.error("Google Login error:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { token, user } = await loginUser(username, password); // Call API
      login(user, token); // Update context

      // Redirect based on user role
      navigateBasedOnRole(user.userType);

      toast.success("Login successful");
    } catch (err) {
      toast.error("Login failed");
      console.error(err);
    }
  };

  const navigateBasedOnRole = (role) => {
    if (role === "Owner") {
      navigate("/owner-dashboard");
    } else if (role === "Seeker") {
      navigate("/landing");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex justify-center items-center flex-col font-sans">
      <div className=" rounded-[10px] w-[80%] sm:w-8/12 md:w-6/12 lg:w-4/12 xl:w-3/12 2xl:w-1/6 h-fit text-center p-[24px] bg-gray-100 text-black shadow-lg border border-gray-400">
        <h2 className="font-extrabold text-2xl text-blue-800 mb-1">LOGIN</h2>
        <p className="text-xs mb-[30px]">Welcome to iRenta!</p>
        <form
          onSubmit={handleSubmit}
          className="gap-4 flex justify-center items-center flex-col"
        >
          <input
            className="w-full px-[20px] py-[10px] rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-300"
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

          <button
            type="submit"
            className="mt-[10px] w-[100%] px-[20px] py-[10px] rounded-md bg-blue-800 text-white hover:bg-blue-600 transition ease-in duration-300"
          >
            Log in
          </button>
          <hr className="w-full"></hr>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => {
              console.log("Google Login Failed");
            }}
          />
        </form>
      </div>
      <Link to="/register">
        <h3 className="mt-[10px] text-sm">
          New to iRenta?{" "}
          <span className="text-blue-600 hover:underline font-bold">
            Sign Up
          </span>
        </h3>
      </Link>
    </div>
  );
};

export default Login;
