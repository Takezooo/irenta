import mongoose from "mongoose";
import Users from "../models/Users.js";
import BCrypt from "../config/BCrypt.js";
import dotenv from "dotenv";
import driveService from "../utils/driveService.js";

dotenv.config();

// function for geting all users
const getAllUsers = async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// function for getting a specific user
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

// function for creating a new user
const createUser = async (req, res) => {
    try {
        const { body, file } = req;
        const user = JSON.parse(body.user);

        let userProfile = {}
        
        // upload file part
        if (file) {
            const {id, name} = await driveService.UploadFiles(
                file,
                process.env.PROFILE_FOLDER_ID
            );
        
            Object.assign(userProfile, {
                id: id,
                name: name,
                link: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
            });
        }

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
                profile: userProfile,
                userType: user.userType,
                address: user.address,
            },
        });

        res.status(200).json(result);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// function for updating user info
const updateUser = async (req, res) => {
    try {
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// function for deleting user
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
