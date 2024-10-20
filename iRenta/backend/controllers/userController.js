import mongoose from "mongoose";
import Users from "../models/Users.js";
import BCrypt from "../config/BCrypt.js";

const getAllUsers = async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getSpecificUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid Id!" });
        }

        const user = await Users.findById(id);
        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const createUser = async (req, res) => {
    try {
        const user = req.body;
        
        const result = await Users.create({
            credentials: {
                username: user.username,
                password: await BCrypt.hash(user.password),
                email: user.email,
            },
            info: {
                firstName: user.firstName,
                middleName: user.middleName, 
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                profile: user.profile,
                userType: user.userType,
                address: user.address,
            },
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
    } catch (error) {
        res.status(400).json({ message: err.message });
    }
};

export default {
    getAllUsers,
    getSpecificUser,
    createUser,
    updateUser,
    deleteUser,
}; 
