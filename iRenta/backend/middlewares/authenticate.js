import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user data to the request
      next(); // Pass control to the next middleware or route handler
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
  
  export default authenticate;