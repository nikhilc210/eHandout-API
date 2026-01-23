import jwt from "jsonwebtoken";

// server/utils/otp.js

// GENERATE 6-DIGIT CODE
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

// OTP EXPIRY (10 minutes from now)
export const otpExpiry = () => {
  return Date.now() + 10 * 60 * 1000;
};

export const generateToken = (vendorId, email) => {
  return jwt.sign({ id: vendorId, email: email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const generateIds = (initial = "", length = 8, alphanumeric = false) => {
  if (length <= 0) throw new Error("Length must be greater than 0");

  const chars = alphanumeric
    ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    : "0123456789";

  let randomPart = "";
  for (let i = 0; i < length; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${initial}${randomPart}`;
};
