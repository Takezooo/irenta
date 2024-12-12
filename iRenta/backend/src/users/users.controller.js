import mongoose from "mongoose";
import Users from "../users/users.model.js";
import BCrypt from "../../global/config/BCrypt.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import driveService from "../../global/utils/Drive.js";
import { OAuth2Client } from "google-auth-library";
import { GenerateToken } from "../../global/utils/GenerateToken.js";
import { GenerateRefreshToken } from "../../global/utils/GenerateRefreshToken.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

dotenv.config();

// function for geting all users
const GetAllUsers = async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// function for getting a specific user
const GetSpecificUser = async (req, res) => {
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
const CreateUser = async (req, res) => {
  try {
    const { body, file } = req;
    const user = JSON.parse(body.user);

    let userProfile = {};

    // upload file part
    if (file) {
      const { id: fileId, name: fileName } = await driveService.UploadFiles(
        file,
        process.env.PROFILE_FOLDER_ID
      );

      Object.assign(userProfile, {
        id: fileId,
        name: fileName,
        link: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
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
        birthDate: user.birthDate,
        gender: user.gender,
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
const UpdateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { body, file } = req;
    const user = JSON.parse(body.user);

    let userProfile = {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Id!" });
    }

    // upload file part
    if (file) {
      const { id: fileId, name: fileName } = await driveService.UploadFiles(
        file,
        process.env.PROFILE_FOLDER_ID
      );

      Object.assign(userProfile, {
        id: fileId,
        name: fileName,
        link: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
      });

      await driveService.DeleteFiles(user.info.profile.id);
    }

    const result = await Users.findByIdAndUpdate(
      user._id,
      {
        $set: {
          credentials: {
            username: user.credentials.username,
            password: await BCrypt.hash(user.credentials.password),
            email: user.credentials.email,
          },
          info: {
            firstName: user.info.firstName,
            middleName: user.info.middleName,
            lastName: user.info.lastName,
            birthDate: user.birthDate,
            gender: user.gender,
            phoneNumber: user.info.phoneNumber,
            profile: userProfile.hasOwnProperty("id")
              ? userProfile
              : user.info.profile,
            userType: user.info.userType,
            address: user.info.address,
          },
        },
      },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// function for deleting user
const DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // const user = JSON.parse(body.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Id!" });
    }

    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    await driveService.DeleteFiles(user.info.profile.id);
    console.log("File Deleted Successfully");

    const result = await Users.findByIdAndDelete(user._id);
    res.status(200).json(result);
    console.log("Deleted Successfully");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// login function
const LoginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await Users.findOne({ "credentials.username": username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare passwords
    const isPasswordCorrect = await BCrypt.compare(
      password,
      user.credentials.password
    );
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials" });

    // Create JWT token
    const token = GenerateToken({
      id: user._id,
      username: user.credentials.username,
      userType: user.info.userType,
    });
    const refreshToken = GenerateRefreshToken({ id: user._id });
    // remove after debugging
    console.log(`Generated Token ${token}`);
    console.log(`Refresh Token: ${refreshToken}`);

    res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.credentials.username,
        userType: user.info.userType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const GoogleLoginUser = async (req, res) => {
  try {
    const { idToken } = req.body;
    console.log("Received idToken:", idToken);
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log("Google user payload:", payload);

    if (!payload) {
      return res.status(400).json({ error: "Invalid Google token" });
    }

    // Extract user details from Google token payload
    const userDetails = {
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
    };

    // Attempt to find the user by email
    const user = await Users.findOne({
      "credentials.email": userDetails.email,
    });

    if (user) {
      // Existing user: generate a JWT token for authentication
      const token = GenerateToken({
        id: user._id,
        username: user.credentials.username,
        userType: user.info.userType,
      });
      const refreshToken = GenerateRefreshToken({ id: user._id });

      // Set cookies
      res.cookie("authToken", token, {
        httpOnly: false, // Allow frontend access
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "Lax", // Lax for compatibility across subdomains
        maxAge: 3600000, // 1 hour
      });
      
      res.cookie("refreshToken", refreshToken, {
        httpOnly: false, // Secure against XSS attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax", // Adjust for compatibility
        maxAge: 7 * 24 * 3600000, // 7 days
      });

      // res.json({ success: true });

      console.log(`Google Generated Token ${token}`);
      console.log(`Google Refresh Token: ${refreshToken}`);
      // Respond with the token and user details for the authenticated session
      res.status(200).json({
        token,
        refreshToken,
        user: {
          id: user._id,
          username: user.credentials.username,
          userType: user.info.userType,
        },
      });
    } else {
      // New user: respond with 200 and Google profile details for registration pre-fill
      res.status(200).json({
        unregistered: true,
        userDetails, // Basic user info for the client to prefill registration
      });
    }
  } catch (error) {
    // Handle any verification or other errors
    console.error("Google Login error:", error);
    res.status(500).json({ message: "Google Login failed" });
  }
};

// Refresh token function
const RefreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user by ID
    const user = await Users.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new access token
    const newToken = GenerateToken({
      id: user._id,
      username: user.credentials.username,
      userType: user.info.userType, // Include userType
    });

    res.cookie("authToken", newToken, {
      httpOnly: false, // Allows frontend access
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error("Refresh token error:", error.message || error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export {
  GetAllUsers,
  GetSpecificUser,
  CreateUser,
  UpdateUser,
  DeleteUser,
  LoginUser,
  GoogleLoginUser,
  RefreshToken,
};
