import jwt from "jsonwebtoken";

export const GenerateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};
