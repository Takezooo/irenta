import React from 'react'
import { Outlet, Navigate } from "react-router-dom";

const PrivateRoutes = () => {

    const user = false;

    return (
        <>
            {user ? <Outlet/> : <Navigate to="/login" />}
        </>
    )
}

export default PrivateRoutes