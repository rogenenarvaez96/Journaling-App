import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to verify JWT access token
export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "temp_secret");
      req.user = await User.findById(decoded.id).select("-passwordHash");
      
      if (!req.user || !req.user.active) {
        return res.status(401).json({ message: "Not authorized, user inactive or not found" });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

// Middleware to restrict access based on roles
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    // Check if the authenticated user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};
