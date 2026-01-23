import express from "express";
import {
  getCurrentVendorInformation,
  updateVendorBankInformation,
  updateVendorInformation,
  getCurrentVendorBankInfo,
  createeBookCover,
  updateeBookCover,
  getAlleBookCover,
  geteBookCoverInformation,
  registerStoreVendor,
  verifyStoreVendor,
  resendStoreVendorOtp,
  storeVendorAuth,
} from "../../controllers/Store/Vendor/index.js";
import { verifyToken } from "../../middleware/Tokens/index.js";

const router = express.Router();
router.post("/register", registerStoreVendor);
router.post("/verifyOtp", verifyStoreVendor);
router.post("/resendOtp", resendStoreVendorOtp);
router.post("/auth", storeVendorAuth);
router.post("/vendorInformation", verifyToken, updateVendorInformation);
router.get("/vendorInformation", verifyToken, getCurrentVendorInformation);
router.post("/vendorBankInformation", verifyToken, updateVendorBankInformation);
router.get("/vendorBankInformation", verifyToken, getCurrentVendorBankInfo);
router.post("/vendoreBookCover", verifyToken, createeBookCover);
router.put("/vendoreBookCover", verifyToken, updateeBookCover);
router.get("/vendoreBookCover", verifyToken, getAlleBookCover);
router.get("/vendoreBookCover/:coverId", verifyToken, geteBookCoverInformation);

export default router;
