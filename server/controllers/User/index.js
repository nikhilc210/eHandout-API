import bcrypt from "bcryptjs";
import { User } from "../../models/User/index.js";
import { generateOtp, otpExpiry, generateToken } from "../../utils/index.js";

// POST /api/user/auth/login
// Body: { eliteId? shareId? email?, password }
// Generates an OTP, stores it on the user document with expiry and returns the OTP in response
export const loginGenerateOtp = async (req, res) => {
  try {
    const { eliteId, shareId, email, password } = req.body || {};

    if (!password || (!eliteId && !shareId && !email)) {
      return res.status(400).json({
        success: false,
        message: "Provide identifier (eliteId/shareId/email) and password",
      });
    }

    // Build query based on provided identifier
    const query = eliteId
      ? { eliteId }
      : shareId
        ? { shareId }
        : { email: email && email.toLowerCase() };

    const user = await User.findOne(query);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate OTP and expiry
    const otp = generateOtp();
    const expiryTs = otpExpiry(); // returns ms timestamp

    user.otp = otp;
    user.otpExpiry = new Date(expiryTs);
    await user.save();

    // NOTE: per request, return OTP in response. In production you may want to send via SMS/Email and not expose it.
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
    const { eliteId, shareId, email, otp } = req.body || {};

    if (!otp || (!eliteId && !shareId && !email)) {
      return res.status(400).json({
        success: false,
        message: "Provide identifier (eliteId/shareId/email) and otp",
      });
    }

    const query = eliteId
      ? { eliteId }
      : shareId
        ? { shareId }
        : { email: email && email.toLowerCase() };

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
