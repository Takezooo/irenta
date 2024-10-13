// authRoutes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';  // Import the User model
import Owners from '../models/Owners.js';

const router = express.Router();

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
    const { firstName, middleName, lastName, email, phoneNumber, imageUrl, password, userRole, address, ownerDetails } = req.body;

    console.log("Incoming registration data:", req.body); // Log the request body for debugging

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user object
        user = new User({
            name: {
                firstName,
                middleName,
                lastName,
            },
            email,
            phoneNumber,
            imageUrl,
            password: await bcrypt.hash(password, 10),  // Hash the password
            userRole,
        });

        // Save the user in the database
        await user.save();

        // If userRole is Owner, save owner details
        if (userRole === 'Owners') {
            const ownerDetailsData = new Owners({
                userId: user.id, // Link back to the User
                address: {
                    houseNumber: address.houseNumber,
                    street: address.street,
                    city: address.city,
                    zip: address.zip,
                },
                businessPermitPath: ownerDetails.businessPermitPath,
                verificationStatus: ownerDetails.verificationStatus, // Adjust as necessary
            });

            // Save the owner in the owners table
            await ownerDetailsData.save();
        }

        // Generate a JWT token for authentication
        const payload = {
            user: {
                id: user.id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },  // Token valid for 1 hour
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error("Error in registration:", err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
