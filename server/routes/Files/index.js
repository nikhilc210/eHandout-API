import express from "express";
import multer from "multer";
import { uploadVendorIdentity } from "../../controllers/Files/upload/index.js";
import { verifyToken } from "../../middleware/Tokens/index.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload/vendor-identity
router.post(
  "/upload/vendor-identity",
  verifyToken,
  upload.single("file"),

  uploadVendorIdentity
);

export default router;
