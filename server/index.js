import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import {
  registerStoreVendor,
  resendStoreVendorOtp,
  storeVendorAuth,
  verifyStoreVendor,
} from "./controllers/Store/Vendor/index.js";
import uploadRoutes from "./routes/Files/index.js";
import vendorInformation from "./routes/Vendor/index.js";
import lmsRoutes from "./routes/LMS/index.js";
import managerRoutes from "./routes/Manager/index.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
// Connect DB
connectDB();
app.use(express.json({ limit: "100mb" })); // handles JSON body

// Routes

app.use("/api/file/", uploadRoutes);
app.use("/api/store/vendor", vendorInformation);
app.use("/api/lms", lmsRoutes); //this route will use to create LMS, Student and Lecturer Account
app.use("/api/manager", managerRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ eHandout API running successfully" });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "production"
    } mode on port ${PORT}`
  );
});
