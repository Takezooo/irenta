import React from "react";
import { Link } from "react-router-dom";

const NotAuthorized = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
      <p className="text-gray-700 mt-2">You do not have permission to access this page.</p>
      <Link
        to="/login"
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
      >
        Go Back to Home
      </Link>
    </div>
  );
};

export default NotAuthorized;
