import express from "express";
import {
    GetAllUsers,
    GetSpecificUser,
    CreateUser,
    UpdateUser,
    DeleteUser,
    LoginUser,
    GoogleLoginUser,
} from "./users.controller.js";
import upload from "../../global/config/Multer.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

// routes for allusers and specificuser, add user, update user, and delete user
router.get("/", GetAllUsers);
router.get('/users', RequireAuth, GetAllUsers);

router.get("/:id", GetSpecificUser);

// route for create/upload profile and picture
router.post("/", upload.single("file"), CreateUser);

// route for update profile and picture
router.patch("/:id", upload.single("file"), UpdateUser);

router.delete("/:id", DeleteUser);

// for login purpose
router.post("/login", LoginUser);
router.post('/google-login', GoogleLoginUser); // Google login

export default router;