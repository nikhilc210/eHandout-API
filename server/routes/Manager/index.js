import express from "express";
import { verifyActivationCode } from "../../controllers/Manager/index.js";

const router = express.Router();
router.post("/verifycode", verifyActivationCode);

export default router;
