import mongoose from "mongoose";

const managerAccountSchema = mongoose.Schema(
  {
    adminId: { type: String, required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    country: { type: String, required: true },
    activationCode: { type: String, required: true },
    expiry: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPERADMIN", "ADMINSTRATOR", "ACCOUNTANT"],
      required: true,
    },
  },
  { timestamps: true }
);

const Manager = mongoose.model("manager", managerAccountSchema);

export default Manager;
