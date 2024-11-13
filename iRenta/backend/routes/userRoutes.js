import express from "express";
import userController from "../controllers/userController.js";
import upload from "../config/Multer.js";
import { authenticateToken } from '../config/auth.js';

const userRoutes = express.Router();

// routes for allusers and specificuser, add user, update user, and delete user
userRoutes.get("/", userController.getAllUsers);

userRoutes.get("/:id", userController.getSpecificUser);

// route for create/upload profile and picture
userRoutes.post("/", upload.single("file"), userController.createUser);

// route for update profile and picture
userRoutes.patch("/:id", upload.single("file"), userController.updateUser);

userRoutes.delete("/:id", userController.deleteUser);

//  for checking if the user is authenticated
userRoutes.get('/auth-check', authenticateToken, userController.authCheck);

// for login purpose
userRoutes.post("/login", userController.loginUser);

// Google login
userRoutes.post('/google-login', userController.googleLoginUser);

export default userRoutes;