import jwt from "jsonwebtoken";
import { InvalidatedToken } from "../../models/Store/Vendor/index.js";

export const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1]; // Extract token

    // Check blacklist
    const blacklisted = await InvalidatedToken.findOne({ token });
    if (blacklisted) {
      return res.status(403).json({
        success: false,
        message: "Token has been logged out",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach vendor/user info to request
    req.vendor = decoded;

    // Continue
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
