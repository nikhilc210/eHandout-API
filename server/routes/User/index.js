import express from "express";
import { getLockedPublishedEbooksPublic } from "../../controllers/Store/Vendor/index.js";

const router = express.Router();

// Public route to fetch published locked eBooks filtered by academic discipline
router.get("/lockedPublishedEbooks", getLockedPublishedEbooksPublic);

export default router;
