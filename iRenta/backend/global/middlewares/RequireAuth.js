import jwt from "jsonwebtoken";

const RequireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request
    console.log("Decoded Token:", decoded);
    console.log("Authenticated user:", req.user); // Debugging log
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default RequireAuth;
