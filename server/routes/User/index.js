import express from "express";
import {
  getLockedPublishedEbooksPublic,
  getLockedEbooksPublic,
} from "../../controllers/Store/Vendor/index.js";

const router = express.Router();

// Public route to fetch published locked eBooks filtered by academic discipline
router.get("/lockedPublishedEbooks", getLockedPublishedEbooksPublic);
// Public route to fetch locked published eBooks (not available for borrow)
router.get("/lockedEbooks", getLockedEbooksPublic);

export default router;
