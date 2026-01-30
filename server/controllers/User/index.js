import bcrypt from "bcryptjs";
import { User } from "../../models/User/index.js";
import UserContact from "../../models/Contact/index.js";
import { generateOtp, otpExpiry, generateToken } from "../../utils/index.js";
import jwt from "jsonwebtoken";
import { InvalidatedToken } from "../../models/Store/Vendor/index.js";

// Helper to read multiple possible identifier keys
const readIdentifiers = (body) => {
  const eliteId =
    body.eliteId || body.elite_id || body.eliteid || body.eliteID || null;
  const shareId =
    body.shareId || body.share_id || body.shareid || body.shareID || null;
  const email = body.email || null;
  return { eliteId, shareId, email };
};

// Escape regex special chars
const escapeRegex = (str) => {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

    let user = await User.findOne(query);
    if (!user && (eliteIdInput || shareIdInput || emailInput)) {
      const regexTerms = [];
      if (eliteIdInput) {
        regexTerms.push({
          eliteId: new RegExp(`^${escapeRegex(eliteIdInput)}$`, "i"),
        });
        regexTerms.push({
          elite_id: new RegExp(`^${escapeRegex(eliteIdInput)}$`, "i"),
        });
      }
      if (shareIdInput) {
        regexTerms.push({
          shareId: new RegExp(`^${escapeRegex(shareIdInput)}$`, "i"),
        });
        regexTerms.push({
          share_id: new RegExp(`^${escapeRegex(shareIdInput)}$`, "i"),
        });
        regexTerms.push({
          studentId: new RegExp(`^${escapeRegex(shareIdInput)}$`, "i"),
        });
      }
      if (emailInput) {
        regexTerms.push({
          email: new RegExp(`^${escapeRegex(emailInput)}$`, "i"),
        });
        regexTerms.push({
          emailAddress: new RegExp(`^${escapeRegex(emailInput)}$`, "i"),
        });
      }
      if (regexTerms.length > 0) {
        const fallbackQuery =
          regexTerms.length === 1 ? regexTerms[0] : { $or: regexTerms };
        console.log(
          "loginGenerateOtp - trying fallback regex query:",
          JSON.stringify(fallbackQuery),
        );
        user = await User.findOne(fallbackQuery);
      }
    }
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

    let user = await User.findOne(query);
    if (!user && (eliteIdInput || shareIdInput || emailInput)) {
      const regexTerms = [];
      if (eliteIdInput) {
        regexTerms.push({
          eliteId: new RegExp(`^${escapeRegex(eliteIdInput)}$`, "i"),
        });
        regexTerms.push({
          elite_id: new RegExp(`^${escapeRegex(eliteIdInput)}$`, "i"),
        });
      }
      if (shareIdInput) {
        regexTerms.push({
          shareId: new RegExp(`^${escapeRegex(shareIdInput)}$`, "i"),
        });
        regexTerms.push({
          share_id: new RegExp(`^${escapeRegex(shareIdInput)}$`, "i"),
        });
        regexTerms.push({
          studentId: new RegExp(`^${escapeRegex(shareIdInput)}$`, "i"),
        });
      }
      if (emailInput) {
        regexTerms.push({
          email: new RegExp(`^${escapeRegex(emailInput)}$`, "i"),
        });
        regexTerms.push({
          emailAddress: new RegExp(`^${escapeRegex(emailInput)}$`, "i"),
        });
      }
      if (regexTerms.length > 0) {
        const fallbackQuery =
          regexTerms.length === 1 ? regexTerms[0] : { $or: regexTerms };
        console.log(
          "verifyOtp - trying fallback regex query:",
          JSON.stringify(fallbackQuery),
        );
        user = await User.findOne(fallbackQuery);
      }
    }
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

// POST /api/user/auth/resend
// Body: { eliteId? shareId? email? }
// Regenerates and stores a new OTP for the given identifier and returns it
export const resendOtp = async (req, res) => {
  try {
    const { eliteId, shareId, email } = readIdentifiers(req.body || {});

    const emailInput = email ? email.toString().toLowerCase().trim() : null;
    const eliteIdInput = eliteId ? eliteId.toString().trim() : null;
    const shareIdInput = shareId ? shareId.toString().trim() : null;

    if (!eliteIdInput && !shareIdInput && !emailInput) {
      return res.status(400).json({
        success: false,
        message: "Provide identifier (eliteId/shareId/email) to resend OTP",
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

    console.log("resendOtp - request body:", req.body);
    console.log("resendOtp - constructed query:", JSON.stringify(query));

    let user = await User.findOne(query);
    if (!user && (eliteIdInput || shareIdInput || emailInput)) {
      const regexTerms = [];
      if (eliteIdInput) {
        regexTerms.push({
          eliteId: new RegExp(`^${escapeRegex(eliteIdInput)}$`, "i"),
        });
        regexTerms.push({
          elite_id: new RegExp(`^${escapeRegex(eliteIdInput)}$`, "i"),
        });
      }
      if (shareIdInput) {
        regexTerms.push({
          shareId: new RegExp(`^${escapeRegex(shareIdInput)}$`, "i"),
        });
        regexTerms.push({
          share_id: new RegExp(`^${escapeRegex(shareIdInput)}$`, "i"),
        });
        regexTerms.push({
          studentId: new RegExp(`^${escapeRegex(shareIdInput)}$`, "i"),
        });
      }
      if (emailInput) {
        regexTerms.push({
          email: new RegExp(`^${escapeRegex(emailInput)}$`, "i"),
        });
        regexTerms.push({
          emailAddress: new RegExp(`^${escapeRegex(emailInput)}$`, "i"),
        });
      }
      if (regexTerms.length > 0) {
        const fallbackQuery =
          regexTerms.length === 1 ? regexTerms[0] : { $or: regexTerms };
        console.log(
          "resendOtp - trying fallback regex query:",
          JSON.stringify(fallbackQuery),
        );
        user = await User.findOne(fallbackQuery);
      }
    }
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Generate new OTP and expiry
    const otp = generateOtp();
    const expiryTs = otpExpiry();

    user.otp = otp;
    user.otpExpiry = new Date(expiryTs);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP resent",
      otp,
      otpExpiry: user.otpExpiry,
    });
  } catch (error) {
    console.error("Error in resendOtp:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default { loginGenerateOtp, verifyOtp };

// GET /api/user/auth/me
// Protected: requires Authorization: Bearer <token>
export const getProfile = async (req, res) => {
  try {
    // verifyToken middleware attaches vendor (id/email) to req.vendor
    const decoded = req.vendor;
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(decoded.id).select(
      "-password -otp -otpExpiry",
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in getProfile:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/user/auth/contact
// Protected: submit contact message from logged-in user to eHandout
export const submitContactMessageUser = async (req, res) => {
  try {
    const decoded = req.vendor;
    if (!decoded || !decoded.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { messageCategory, message } = req.body || {};

    // Basic validation
    if (!messageCategory || !String(messageCategory).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Please select a message category." });
    }
    if (!message || !String(message).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter your message." });
    }
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters.",
      });
    }

    // Find user to get email / name
    const user = await User.findById(decoded.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // If account suspended/blocked, reject
    if (user.accountStatus === "Suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended. Please contact support.",
      });
    }

    const email = user.email || user.emailAddress || null;
    let fullName = null;
    // try common fields for full name
    if (user.fullName) fullName = user.fullName;
    else if (user.academicAccount && user.academicAccount.fullName)
      fullName = user.academicAccount.fullName;

    const contact = new UserContact({
      userId: user._id.toString(),
      email: email,
      fullName: fullName,
      messageCategory: String(messageCategory).trim(),
      message: String(message).trim(),
      status: "Pending",
    });

    await contact.save();

    return res.status(201).json({
      success: true,
      message:
        "Thank you for reaching out to The eHandout Team. We will endeavor to respond promptly to your inquiry.",
      data: {
        id: contact._id,
        messageCategory: contact.messageCategory,
        message: contact.message,
        status: contact.status,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Error submitting user contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// POST /api/user/auth/logout
// Protected: invalidates current JWT by inserting into invalidatedtokens collection
export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // Decode token to get expiry
    const decoded = jwt.decode(token);
    let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days
    if (decoded && decoded.exp) {
      expiresAt = new Date(decoded.exp * 1000);
    }

    // Upsert into invalidated tokens collection
    await InvalidatedToken.findOneAndUpdate(
      { token },
      { $set: { expiresAt } },
      { upsert: true, new: true },
    );

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Error during logoutUser:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error: " + error.message,
      });
  }
};

// GET /api/user/auth/me/session-timeout
// Protected: returns the user's session inactive timeout (minutes)
export const getSessionTimeout = async (req, res) => {
  try {
    const decoded = req.vendor;
    if (!decoded || !decoded.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const user = await User.findById(decoded.id).select(
      "sessionInactiveTimeout",
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      data: { sessionInactiveTimeout: user.sessionInactiveTimeout },
    });
  } catch (error) {
    console.error("Error in getSessionTimeout:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/user/auth/me/session-timeout
// Body: { sessionInactiveTimeout: Number }
// Protected: updates user's session inactive timeout (minutes) - website only
export const updateSessionTimeout = async (req, res) => {
  try {
    const decoded = req.vendor;
    if (!decoded || !decoded.id)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const { sessionInactiveTimeout } = req.body || {};

    if (
      sessionInactiveTimeout === undefined ||
      sessionInactiveTimeout === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide sessionInactiveTimeout (minutes) in request body",
      });
    }

    const timeoutNum = Number(sessionInactiveTimeout);
    if (Number.isNaN(timeoutNum) || timeoutNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "sessionInactiveTimeout must be a positive number (minutes)",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.sessionInactiveTimeout = timeoutNum;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your inactive timeout setting was saved successfully",
      data: { sessionInactiveTimeout: user.sessionInactiveTimeout },
    });
  } catch (error) {
    console.error("Error in updateSessionTimeout:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
