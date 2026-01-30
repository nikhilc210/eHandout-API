import bcrypt from "bcryptjs";
import { User } from "../../models/User/index.js";
import { generateOtp, otpExpiry, generateToken } from "../../utils/index.js";

// Helper to read multiple possible identifier keys
const readIdentifiers = (body) => {
  const eliteId =
    body.eliteId || body.elite_id || body.eliteid || body.eliteID || null;
  const shareId =
    body.shareId || body.share_id || body.shareid || body.shareID || null;
  const email = body.email || null;
  return { eliteId, shareId, email };
};

// POST /api/user/auth/login
// Body: { eliteId? shareId? email?, password }
// Generates an OTP, stores it on the user document with expiry and returns the OTP in response
export const loginGenerateOtp = async (req, res) => {
  try {
    const { password } = req.body || {};
    const { eliteId, shareId, email } = readIdentifiers(req.body || {});

    const emailInput = email ? email.toString().toLowerCase().trim() : null;
    const eliteIdInput = eliteId ? eliteId.toString().trim() : null;
    const shareIdInput = shareId ? shareId.toString().trim() : null;

    if (!password || (!eliteIdInput && !shareIdInput && !emailInput)) {
      return res.status(400).json({
        success: false,
        message: "Provide identifier (eliteId/shareId/email) and password",
      });
    }

    // Build a flexible query that tries several common field names used in `student` docs
    const orTerms = [];
    if (eliteIdInput) {
      orTerms.push(
        { eliteId: eliteIdInput },
        { elite_id: eliteIdInput },
        { eliteid: eliteIdInput },
      );
    }
    if (shareIdInput) {
      orTerms.push(
        { shareId: shareIdInput },
        { share_id: shareIdInput },
        { shareid: shareIdInput },
        { studentId: shareIdInput },
      );
    }
    if (emailInput) {
      orTerms.push(
        { email: emailInput },
        { emailAddress: emailInput },
        { email_address: emailInput },
      );
    }

    let query;
    if (orTerms.length === 1) query = orTerms[0];
    else if (orTerms.length > 1) query = { $or: orTerms };
    else query = {};

    console.log("loginGenerateOtp - request body:", req.body);
    console.log("loginGenerateOtp - constructed query:", JSON.stringify(query));

    const user = await User.findOne(query);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verify password (assumes stored hashed)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate OTP and expiry
    const otp = generateOtp();
    const expiryTs = otpExpiry(); // ms timestamp

    user.otp = otp;
    user.otpExpiry = new Date(expiryTs);
    await user.save();

    // Return OTP in response (per request)
    return res.status(200).json({
      success: true,
      message: "OTP generated and saved. It will expire in a short time.",
      otp,
      otpExpiry: user.otpExpiry,
    });
  } catch (error) {
    console.error("Error in loginGenerateOtp:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/auth/verify
// Body: { eliteId? shareId? email?, otp }
// Verifies OTP and returns a JWT auth token
export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body || {};
    const { eliteId, shareId, email } = readIdentifiers(req.body || {});

    const emailInput = email ? email.toString().toLowerCase().trim() : null;
    const eliteIdInput = eliteId ? eliteId.toString().trim() : null;
    const shareIdInput = shareId ? shareId.toString().trim() : null;

    if (!otp || (!eliteIdInput && !shareIdInput && !emailInput)) {
      return res.status(400).json({
        success: false,
        message: "Provide identifier (eliteId/shareId/email) and otp",
      });
    }

    // Build flexible $or query for common student fields
    const orTerms = [];
    if (eliteIdInput) {
      orTerms.push(
        { eliteId: eliteIdInput },
        { elite_id: eliteIdInput },
        { eliteid: eliteIdInput },
      );
    }
    if (shareIdInput) {
      orTerms.push(
        { shareId: shareIdInput },
        { share_id: shareIdInput },
        { shareid: shareIdInput },
        { studentId: shareIdInput },
      );
    }
    if (emailInput) {
      orTerms.push(
        { email: emailInput },
        { emailAddress: emailInput },
        { email_address: emailInput },
      );
    }

    let query;
    if (orTerms.length === 1) query = orTerms[0];
    else if (orTerms.length > 1) query = { $or: orTerms };
    else query = {};

    console.log("verifyOtp - request body:", req.body);
    console.log("verifyOtp - constructed query:", JSON.stringify(query));

    const user = await User.findOne(query);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res
        .status(400)
        .json({ success: false, message: "No OTP requested for this account" });
    }

    // Check expiry
    if (Date.now() > new Date(user.otpExpiry).getTime()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired" });
    }

    if (parseInt(otp, 10) !== parseInt(user.otp, 10)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP valid -> clear it and generate token
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id.toString(), user.email || "");

    return res
      .status(200)
      .json({ success: true, message: "OTP verified", token });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { loginGenerateOtp, verifyOtp };
