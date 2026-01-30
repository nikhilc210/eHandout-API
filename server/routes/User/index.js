import express from "express";
import {
  getLockedPublishedEbooksPublic,
  getLockedEbooksPublic,
  getPublishedEbookByIdPublic,
} from "../../controllers/Store/Vendor/index.js";
import {
  loginGenerateOtp,
  verifyOtp,
  resendOtp,
} from "../../controllers/User/index.js";

const router = express.Router();

// Public route to fetch published locked eBooks filtered by academic discipline
router.get("/lockedPublishedEbooks", getLockedPublishedEbooksPublic);
// Public route to fetch locked published eBooks (not available for borrow)
router.get("/lockedEbooks", getLockedEbooksPublic);
// Public route to get single eBook details by ID
router.get("/publishedEbook/:id", getPublishedEbookByIdPublic);

// User auth routes (OTP based)
router.post("/auth/login", loginGenerateOtp); // provide eliteId/shareId/email + password => returns otp
router.post("/auth/verify", verifyOtp); // provide eliteId/shareId/email + otp => returns JWT token
router.post("/auth/resend", resendOtp); // provide eliteId/shareId/email => returns new otp

export default router;
