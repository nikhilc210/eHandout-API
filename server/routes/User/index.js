import express from "express";
import {
  getLockedPublishedEbooksPublic,
  getLockedEbooksPublic,
  getPublishedEbookByIdPublic,
} from "../../controllers/Store/Vendor/index.js";
import { getPublishedEbookSearch } from "../../controllers/Store/Vendor/index.js";
import { getPublishedEbookAutocomplete } from "../../controllers/Store/Vendor/index.js";
import { verifyToken } from "../../middleware/Tokens/index.js";
import {
  loginGenerateOtp,
  verifyOtp,
  resendOtp,
  getProfile,
  getSessionTimeout,
  updateSessionTimeout,
  submitContactMessageUser,
  logoutUser,
} from "../../controllers/User/index.js";
import {
  getStudentTutorials,
  getStudentTutorialById,
} from "../../controllers/StudentTutorial/index.js";

const router = express.Router();

// Public route to fetch published locked eBooks filtered by academic discipline
router.get("/lockedPublishedEbooks", getLockedPublishedEbooksPublic);
// Public route to fetch locked published eBooks (not available for borrow)
router.get("/lockedEbooks", getLockedEbooksPublic);
// Public route to get single eBook details by ID
router.get("/publishedEbook/:id", getPublishedEbookByIdPublic);

// Student tutorials (public)
router.get("/tutorials", getStudentTutorials);
router.get("/tutorials/:id", getStudentTutorialById);

// Published eBook search (public) - only from Active vendors
router.get("/publishedEbooks/search", getPublishedEbookSearch);
router.get("/publishedEbooks/autocomplete", getPublishedEbookAutocomplete);

// User auth routes (OTP based)
router.post("/auth/login", loginGenerateOtp); // provide eliteId/shareId/email + password => returns otp
router.post("/auth/verify", verifyOtp); // provide eliteId/shareId/email + otp => returns JWT token
router.post("/auth/resend", resendOtp); // provide eliteId/shareId/email => returns new otp
// Protected route to fetch logged-in user profile
router.get("/auth/me", verifyToken, getProfile);
// Session timeout (website-only) - get and update
router.get("/auth/me/session-timeout", verifyToken, getSessionTimeout);
router.put("/auth/me/session-timeout", verifyToken, updateSessionTimeout);
// Contact eHandout (user -> eHandout)
router.post("/auth/contact", verifyToken, submitContactMessageUser);
// Logout user (invalidate current JWT)
router.post("/auth/logout", verifyToken, logoutUser);

export default router;
