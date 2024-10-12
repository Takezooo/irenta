import express from 'express';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/Users.js';  // Assuming you have your User model here

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, middleName, lastName, email, phoneNumber, password, userRole } = req.body;

        try {
            // Check if the user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            // Create a new user instance
            user = new User({
                name: {
                    firstName,
                    middleName,
                    lastName,
                },
                email,
                phoneNumber,
                password,
                userRole,  // e.g., Owner, Seeker, Renter
            });

            // Hash the password before saving
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            // Create and return a JWT token for immediate authentication
            const payload = {
                user: {
                    id: user.id,
                    role: user.userRole
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
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Server error');
        }
    }
);

export default router;
