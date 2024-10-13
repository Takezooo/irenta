// src/components/Register.js

import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [password, setPassword] = useState('');
    const [userRole, setUserRole] = useState('Seeker');  // Default to Seeker

    // Owner-specific fields
    const [houseNumber, setHouseNumber] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [zip, setZip] = useState('');
    const [businessPermitPath, setBusinessPermitPath] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Collect all the fields for the request body
        const requestBody = {
            firstName,
            middleName,
            lastName,
            email,
            phoneNumber,
            imageUrl,
            password,
            userRole,
            // Include address and ownerDetails only if userRole is 'Owner'
            ...(userRole === 'Owners' && {
                address: {
                    houseNumber,
                    street,
                    city,
                    zip,
                },
                ownerDetails: {
                    businessPermitPath,
                    verificationStatus: 'Basic', // or whatever default you want
                },
            }),
        };

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', requestBody);
            console.log('Registration Successful:', response.data);
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                console.error('Registration Error:', error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
            } else {
                // Something happened in setting up the request that triggered an error
                console.error('Error:', error.message);
            }
        }        
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                {/* Name fields */}
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Middle Name"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                {/* Phone Number */}
                <input
                    type="text"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                />

                {/* Profile Image URL */}
                <input
                    type="text"
                    placeholder="Profile Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {/* Role Selection (Seeker or Owner) */}
                <div>
                    <label>
                        <input
                            type="radio"
                            value="Seeker"
                            checked={userRole === 'Seeker'}
                            onChange={() => setUserRole('Seeker')}
                        />
                        Seeker
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="Owners"
                            checked={userRole === 'Owners'}
                            onChange={() => setUserRole('Owners')}
                        />
                        Owners
                    </label>
                </div>

                {/* Owner-specific fields (conditionally rendered) */}
                {userRole === 'Owners' && (
                    <>
                        <h3>Owner Details</h3>
                        <input
                            type="text"
                            placeholder="House Number"
                            value={houseNumber}
                            onChange={(e) => setHouseNumber(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="ZIP Code"
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Business Permit URL"
                            value={businessPermitPath}
                            onChange={(e) => setBusinessPermitPath(e.target.value)}
                        />
                    </>
                )}

                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
