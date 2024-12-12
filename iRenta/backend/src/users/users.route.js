import express from "express";
import {
    GetAllUsers,
    GetSpecificUser,
    CreateUser,
    UpdateUser,
    DeleteUser,
    LoginUser,
    GoogleLoginUser,
    RefreshToken,
} from "./users.controller.js";
import upload from "../../global/config/Multer.js";
import RequireAuth from "../../global/middlewares/RequireAuth.js";

const router = express.Router();

// routes for allusers and specificuser, add user, update user, and delete user
router.get("/", RequireAuth, GetAllUsers);
// router.get('/all-users', RequireAuth, GetAllUsers);

router.get("/:id", RequireAuth, GetSpecificUser);

// route for create/upload profile and picture
router.post("/", RequireAuth, upload.single("file"), CreateUser);

// route for update profile and picture
router.patch("/:id", RequireAuth, upload.single("file"), UpdateUser);

router.delete("/:id", RequireAuth, DeleteUser);

// for login purpose
router.post("/login", LoginUser);
router.post('/google-login', GoogleLoginUser); // Google login

router.post("/refresh-token", RefreshToken);

export default router;