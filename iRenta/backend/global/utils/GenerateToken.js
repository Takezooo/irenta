import jwt from "jsonwebtoken";

export const GenerateToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      username: payload.username,
      userType: payload.userType, // Ensure userType is included
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};