import mongoose from "mongoose";

// Minimal User schema for authentication + OTP storage
const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    eliteId: { type: String, required: false, index: true },
    shareId: { type: String, required: false, index: true },
    email: { type: String, required: false, index: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    otp: { type: Number },
    otpExpiry: { type: Date },
    accountStatus: {
      type: String,
      enum: ["Pending", "Active", "Suspended"],
      default: "Active",
    },
  },
  { timestamps: true },
);

// Export named model to match project style
export const User = mongoose.model("User", userSchema, "users");
