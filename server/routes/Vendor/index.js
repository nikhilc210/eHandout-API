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
  publishEbook,
  getAllLockedBookCovers,
  getActiveAcademicDisciplines,
  getAllLockedEbooks,
  getMyPublishedEbooks,
  getPublishedEbookById,
  updatePublishedEbook,
  submitTestimonial,
  changePassword,
  toggleTwoFactorAuth,
  verifyTwoFactorCode,
  getTwoFactorStatus,
  setInactiveTimeout,
  submitContactMessage,
  getVendorDashboard,
} from "../../controllers/Store/Vendor/index.js";
import { verifyToken } from "../../middleware/Tokens/index.js";

const router = express.Router();
router.post("/register", registerStoreVendor);
router.post("/verifyOtp", verifyStoreVendor);
router.post("/resendOtp", resendStoreVendorOtp);
router.post("/auth", storeVendorAuth);
router.get("/dashboard", verifyToken, getVendorDashboard);
router.post("/vendorInformation", verifyToken, updateVendorInformation);
router.get("/vendorInformation", verifyToken, getCurrentVendorInformation);
router.post("/vendorBankInformation", verifyToken, updateVendorBankInformation);
router.get("/vendorBankInformation", verifyToken, getCurrentVendorBankInfo);
router.post("/vendoreBookCover", verifyToken, createeBookCover);
router.put("/vendoreBookCover", verifyToken, updateeBookCover);
router.get("/vendoreBookCover", verifyToken, getAlleBookCover);
router.get("/vendoreBookCover/:coverId", verifyToken, geteBookCoverInformation);
router.get("/lockedBookCovers", verifyToken, getAllLockedBookCovers);
router.get("/academicDisciplines", verifyToken, getActiveAcademicDisciplines);
router.get("/lockedEbooks", verifyToken, getAllLockedEbooks);
router.get("/myPublishedEbooks", verifyToken, getMyPublishedEbooks);
router.get("/publishedEbook/:ebookId", verifyToken, getPublishedEbookById);
router.put("/publishedEbook/:ebookId", verifyToken, updatePublishedEbook);
router.post("/testimonial", verifyToken, submitTestimonial);
router.put("/changePassword", verifyToken, changePassword);
router.post("/toggleTwoFactor", verifyToken, toggleTwoFactorAuth);
router.post("/verifyTwoFactor", verifyToken, verifyTwoFactorCode);
router.get("/twoFactorStatus", verifyToken, getTwoFactorStatus);
router.put("/inactiveTimeout", verifyToken, setInactiveTimeout);
router.post("/vendorContact", verifyToken, submitContactMessage);
router.post("/publishEbook", verifyToken, publishEbook);

export default router;
