import mongoose from "mongoose";

// Schema for user contact messages to eHandout
const userContactSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Mongo _id of the user as string
    email: { type: String },
    fullName: { type: String },
    messageCategory: { type: String, required: true },
    message: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },
    response: { type: String },
    respondedAt: { type: Date },
  },
  { timestamps: true },
);

const UserContact = mongoose.model(
  "UserContact",
  userContactSchema,
  "usercontacts",
);

export default UserContact;
