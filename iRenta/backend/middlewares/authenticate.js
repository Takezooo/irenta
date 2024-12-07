import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized access: No token provided" });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET in environment variables.");
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT Payload:", decoded);
    // Attach user data to the request
    req.user = {
      id: decoded.id,
      userType: decoded.userType, // Attach only relevant user data
    };
    ;
    next(); // Pass control to the next middleware or route handler
  } catch (err) {
    // Handle specific JWT errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    }
    // Generic error response
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

export default authenticate;
