import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    // Log the token to check if it's being received
    console.log('Token from Authorization header:', token);
  
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }
  
    try {
      // Verify the token and decode it
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
      req.user = decoded; // Attach the decoded token data to req.user
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ message: 'Invalid token' });
    }
  };