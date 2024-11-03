import express from "express";

import userController from "../controllers/userController.js";
import upload from "../config/Multer.js";

const userRoutes = express.Router();

// routes for allusers and specificuser, add user, update user, and delete user
userRoutes.get("/", userController.getAllUsers);

userRoutes.get("/:id", userController.getSpecificUser);

// route for create/upload profile and picture
userRoutes.post("/", upload.single("file"), userController.createUser);

// route for update profile and picture
userRoutes.patch("/:id", upload.single("file"), userController.updateUser);

userRoutes.delete("/:id", userController.deleteUser);

// for login purpose
userRoutes.post("/login", userController.loginUser);

export default userRoutes;
//test