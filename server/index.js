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
import userRoutes from "./routes/User/index.js";
import managerRoutes from "./routes/Manager/index.js";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

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
app.use("/api/user", userRoutes); // public user routes
app.use("/api/manager", managerRoutes);

// --- Swagger / OpenAPI setup ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "eHandout API",
      version: "1.0.0",
      description:
        "Auto-generated API documentation from source JSDoc/OpenAPI comments",
    },
    // No securitySchemes defined here — keep Swagger UI simple/public for now
  },
  // Support both running from project root or from the `server` folder:
  // include both relative globs so swagger-jsdoc finds controllers/routes regardless of cwd
  apis: [
    "./controllers/**/*.js",
    "./routes/**/*.js",
    "./server/controllers/**/*.js",
    "./server/routes/**/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
// Log discovered paths for debugging (temporary)
try {
  const paths =
    swaggerSpec && swaggerSpec.paths ? Object.keys(swaggerSpec.paths) : [];
  console.log("[swagger] discovered paths:", JSON.stringify(paths, null, 2));
} catch (e) {
  console.warn("[swagger] error while inspecting spec:", e && e.message);
}

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ eHandout API running successfully" });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "production"
    } mode on port ${PORT}`,
  );
});
