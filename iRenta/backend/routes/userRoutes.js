import express from "express";

import userController from "../controllers/userController.js";

const userRoutes = express.Router();

userRoutes.get("/", userController.getAllUsers);

userRoutes.get("/:id", userController.getSpecificUser);

userRoutes.post("/create", userController.createUser);

userRoutes.patch("/update/:id", userController.updateUser);

userRoutes.delete("/delete/:id", userController.deleteUser);

export default userRoutes;
