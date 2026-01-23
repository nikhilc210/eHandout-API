import { parsePhoneNumber } from "libphonenumber-js/min";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateIds, generateOtp, otpExpiry } from "../../../utils/index.js";
import {
  StoreVendor,
  StoreVendorInformation,
  StoreVendorBankInformation,
  StoreVendoreBookCover,
  VendorEbook,
} from "../../../models/Store/Vendor/index.js";
export const registerStoreVendor = async (req, res) => {
  console.log("Request body:", req.body); // <--- add this

  try {
    const { country, email, phoneCode, mobile, password } = req.body;
    if (!country || !email || !phoneCode || !mobile || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existing = await StoreVendor.findOne({ email });
    if (existing)
      return res.status(400).json({
        success: false,
        message: "Vendor with this email already exists",
      });

    //OTP Generation

    const otp = generateOtp();
    // OTP Expiry
    const otpExpiryIn = otpExpiry();

    //TODO: send otp via email

    //Format phone number
    const fullNumber = `${phoneCode}${mobile}`;
    const phoneObj = parsePhoneNumber(fullNumber);

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateIds("V", 10, false);
    const vendor = await StoreVendor.create({
      country,
      email,
      phoneCode,
      mobile,
      password: hashedPassword,
      otp,
      otpExpiry: otpExpiryIn,
      vendorId: id,
    });
    await vendor.save();
    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully. OTP generated",
      otp,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error " + error,
    });
  }
};

export const verifyStoreVendor = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Email and otp required" });

    const vendor = await StoreVendor.findOne({ email });

    if (!vendor)
      return res
        .status(400)
        .json({ success: false, message: "Vendor not found" });

    if (vendor.otp !== Number(otp))
      return res.status(400).json({ success: false, message: "Invalid otp" });

    if (vendor.otpExpiry < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    // Optional: mark vendor as verified
    vendor.emailVerified = true;
    vendor.otp = null; // remove OTP
    vendor.otpExpiry = null; // remove expiry
    vendor.accountStatus = "Active";
    await vendor.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: vendor._id, email: vendor.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    return res.status(200).json({
      success: true,
      message: "Thank you for signing up with eHandout Books  as a vendor",
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error " + error });
  }
};

export const resendStoreVendorOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid email address",
      });
    }
    const otp = generateOtp();
    const expiry = otpExpiry();
    const vendor = await StoreVendor.findOne({ email });
    if (!vendor)
      return res.status(400).json({
        success: false,
        message: "Account with this email does not exists",
      });

    //TODO resend otp from here

    vendor.otp = otp; // update OTP
    vendor.otpExpiry = expiry; // update expiry
    await vendor.save();
    return res.status(200).json({
      success: true,
      message: "OTP resent",
      otp,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error " + error });
  }
};

export const storeVendorAuth = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });

    const vendor = await StoreVendor.findOne({ email });
    if (!vendor)
      return res.status(400).json({
        success: false,
        message: "Please provide valid email address or password",
      });
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Please provide valid email address or password" });
    }

    // Generate OTP
    const otp = generateOtp();
    const otpExpiresAt = otpExpiry();

    vendor.otp = otp;
    vendor.otpExpiry = otpExpiresAt;
    await vendor.save();

    // 📨 TODO: send OTP to vendor email (future)
    res.status(200).json({
      success: true,
      message: "OTP generated successfully (for testing only)",
      otp, // REMOVE later in production
      email: vendor.email,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error " + message });
  }
};

export const updateVendorInformation = async (req, res) => {
  try {
    const { id, email } = req.vendor;

    const {
      accountType,
      vendorType,
      vendorName,
      tin,
      address,
      city,
      state,
      country,
      identityType,
      dateOfIssue,
      expiryDate,
      identityFile,
    } = req.body;
    if (
      !accountType ||
      !vendorType ||
      !vendorName ||
      !address ||
      !city ||
      !state ||
      !country ||
      !identityType ||
      !dateOfIssue ||
      !expiryDate ||
      !identityFile
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    } else {
      const vendorInfo = await StoreVendorInformation.create({
        vendorId: id,
        accountType,
        vendorType,
        vendorName,
        tin,
        address,
        city,
        state,
        country,
        identityType,
        dateOfIssue,
        expiryDate,
        identityFile,
      });
      vendorInfo.save();
      return res.status(200).json({
        success: true,
        message: "Your information has ben submitted successfully",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error " + error });
  }
};

export const getCurrentVendorInformation = async (req, res) => {
  try {
    const { id } = req.vendor;
    console.log(id);
    const vendor = await StoreVendorInformation.findOne({ vendorId: id });
    if (!vendor) {
      return res
        .status(400)
        .json({ success: false, message: "Vendor Information not available" });
    } else {
      return res.status(200).json({
        success: true,
        message: "Vendor Information retrived successfully",
        vendor,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error " + error });
  }
};

export const updateVendorBankInformation = async (req, res) => {
  try {
    const { id } = req.vendor;
    const {
      bankCountry,
      bankBranchState,
      bankCurrency,
      bankName,
      bankBranchName,
      bankBranchCode,
      swiftBicCode,
      accountNumber,
      accountHolderName,
      accountType,
      routingNumber,
      sortCode,
    } = req.body;
    if (
      !bankCountry ||
      !bankBranchState ||
      !bankCurrency ||
      !bankName ||
      !bankBranchName ||
      !bankBranchCode ||
      !swiftBicCode ||
      !accountNumber ||
      !accountHolderName
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Some fields are mission" });
    } else {
      const bank = await StoreVendorBankInformation({
        vendorId: id,
        bankCountry,
        bankBranchState,
        bankCurrency,
        bankName,
        bankBranchName,
        bankBranchCode,
        swiftBicCode,
        accountNumber,
        accountHolderName,
        accountType,
        routingNumber,
        sortCode,
      });
      bank.save();
      return res.status(200).json({
        success: true,
        message:
          "Your bank account information has been submitted successfully",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error " + error });
  }
};

export const getCurrentVendorBankInfo = async (req, res) => {
  try {
    const { id } = req.vendor;
    const bank = await StoreVendorBankInformation.findOne({ vendorId: id });
    if (!bank)
      return res.status(400).json({
        success: false,
        message: "Vendor Bank information is not available",
      });

    return res.status(200).json({
      success: true,
      message: "Vendor bank information retreived successfully",
      bank,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error " + error });
  }
};

export const createeBookCover = async (req, res) => {
  try {
    const { id } = req.vendor;
    const { coverName, coverURL } = req.body;
    const coverId = generateIds("EC", 6, true);
    const eBookCover = await StoreVendoreBookCover({
      vendorId: id,
      coverId,
      coverName,
      coverURL,
    });
    eBookCover.save();
    return res
      .status(200)
      .json({ success: true, message: "eBook cover saved successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error " + error });
  }
};

export const updateeBookCover = async (req, res) => {
  try {
    const { id } = req.vendor;
    const { coverId, coverName, isLocked, coverURL } = req.body;
    const cover = await StoreVendoreBookCover.findByIdAndUpdate(
      coverId,
      { coverName, isLocked, coverURL },
      { new: true },
    );

    if (!cover)
      return res
        .status(400)
        .json({ success: false, message: "This eBook Cover is not available" });

    return res
      .status(200)
      .json({ success: true, message: "eBook cover updated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error " + error });
  }
};

export const getAlleBookCover = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor;
    const covers = await StoreVendoreBookCover.find({ vendorId });
    if (!covers || covers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No eBook covers found for this vendor.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Covers fetched successfully.",
      data: covers,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error " + error });
  }
};

export const geteBookCoverInformation = async (req, res) => {
  try {
    const { coverId: id } = req.params; // from URL parameter

    // Find one cover that belongs to this vendor and matches coverId
    const cover = await StoreVendoreBookCover.findById(id);

    if (!cover) {
      return res.status(404).json({
        success: false,
        message: "eBook cover not found for this vendor.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "eBook cover fetched successfully.",
      data: cover,
    });
  } catch (error) {
    console.error("Error fetching eBook cover:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// Helper function to parse price strings with commas
const parsePrice = (priceString) => {
  if (typeof priceString === "number") return priceString;
  if (typeof priceString === "string") {
    return parseFloat(priceString.replace(/,/g, ""));
  }
  return 0;
};

// Helper function to validate ISBN format
const isValidISBN = (isbn) => {
  // Remove hyphens and spaces
  const cleanISBN = isbn.replace(/[-\s]/g, "");

  // ISBN-10 or ISBN-13
  if (cleanISBN.length === 10) {
    // ISBN-10 validation
    const regex = /^[0-9]{9}[0-9X]$/;
    return regex.test(cleanISBN);
  } else if (cleanISBN.length === 13) {
    // ISBN-13 validation
    const regex = /^[0-9]{13}$/;
    return regex.test(cleanISBN);
  }
  return false;
};

export const publishEbook = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor;

    // Extract all fields from request body
    const {
      academicDiscipline,
      ebookTitle,
      author,
      publisher,
      publishedDate,
      edition,
      series,
      isbn,
      language,
      synopsis,
      aboutAuthor,
      academicRecommendation,
      publicDomain,
      ebookCover,
      ebookContent,
      salePrice,
      makeAvailableForBorrow,
      borrowFee,
      borrowPeriod,
      legalAuthorization,
    } = req.body;

    // Validate required fields
    if (
      !academicDiscipline ||
      !ebookTitle ||
      !author ||
      !publisher ||
      !publishedDate ||
      !isbn ||
      !language ||
      !synopsis ||
      !aboutAuthor ||
      !academicRecommendation ||
      !publicDomain ||
      !ebookCover ||
      !ebookContent ||
      salePrice === undefined ||
      legalAuthorization === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate legalAuthorization
    if (legalAuthorization !== true) {
      return res.status(400).json({
        success: false,
        message: "You must accept legal authorization to publish an eBook",
      });
    }

    // Validate academicRecommendation and publicDomain
    if (!["yes", "no"].includes(academicRecommendation)) {
      return res.status(400).json({
        success: false,
        message: 'academicRecommendation must be "yes" or "no"',
      });
    }

    if (!["yes", "no"].includes(publicDomain)) {
      return res.status(400).json({
        success: false,
        message: 'publicDomain must be "yes" or "no"',
      });
    }

    // Validate ISBN format
    if (!isValidISBN(isbn)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid ISBN format. Please provide a valid ISBN-10 or ISBN-13",
      });
    }

    // Parse and validate sale price
    const parsedSalePrice = parsePrice(salePrice);
    if (parsedSalePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Sale price must be a positive number",
      });
    }

    // Validate borrow-related fields
    let parsedBorrowFee = null;
    let parsedBorrowPeriod = null;

    if (makeAvailableForBorrow === true) {
      if (!borrowFee || !borrowPeriod) {
        return res.status(400).json({
          success: false,
          message:
            "borrowFee and borrowPeriod are required when makeAvailableForBorrow is true",
        });
      }

      parsedBorrowFee = parsePrice(borrowFee);
      if (parsedBorrowFee <= 0) {
        return res.status(400).json({
          success: false,
          message: "Borrow fee must be a positive number",
        });
      }

      parsedBorrowPeriod = parseInt(borrowPeriod);
      if (!Number.isInteger(parsedBorrowPeriod) || parsedBorrowPeriod <= 0) {
        return res.status(400).json({
          success: false,
          message: "Borrow period must be a positive integer (number of days)",
        });
      }
    }

    // Check if vendor has completed required information
    const vendorInfo = await StoreVendorInformation.findOne({ vendorId });
    if (!vendorInfo) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete your Vendor Information before publishing an eBook",
      });
    }

    const vendorBankInfo = await StoreVendorBankInformation.findOne({
      vendorId,
    });
    if (!vendorBankInfo) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete your Bank Information before publishing an eBook",
      });
    }

    // Validate that ebookCover and ebookContent are valid URLs
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(ebookCover)) {
      return res.status(400).json({
        success: false,
        message: "ebookCover must be a valid HTTP/HTTPS URL",
      });
    }

    if (!urlRegex.test(ebookContent)) {
      return res.status(400).json({
        success: false,
        message: "ebookContent must be a valid HTTP/HTTPS URL",
      });
    }

    // Generate unique eBook ID (ENG + 12 random numbers)
    const ebookId = generateIds("ENG", 12, false);

    // Create the eBook
    const newEbook = await VendorEbook.create({
      vendorId,
      ebookId,
      academicDiscipline,
      ebookTitle,
      author,
      publisher,
      publishedDate,
      edition: edition || "",
      series: series || "",
      isbn,
      language,
      synopsis,
      aboutAuthor,
      academicRecommendation,
      publicDomain,
      ebookCover,
      ebookContent,
      salePrice: parsedSalePrice,
      makeAvailableForBorrow: makeAvailableForBorrow || false,
      borrowFee: parsedBorrowFee,
      borrowPeriod: parsedBorrowPeriod,
      legalAuthorization,
      status: "Pending Review",
      dateListed: new Date(),
    });

    await newEbook.save();

    // Format the date for response
    const formattedDate = new Date().toISOString().split("T")[0];

    return res.status(201).json({
      success: true,
      message: "eBook published successfully",
      data: {
        ebookId: newEbook.ebookId,
        status: newEbook.status,
        dateListed: formattedDate,
      },
    });
  } catch (error) {
    console.error("Error publishing eBook:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};
