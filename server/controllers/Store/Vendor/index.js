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
  PublishedEbook,
  VendorTestimonial,
  VendorContact,
  VendorTutorial,
  VendorConsultation,
  InvalidatedToken,
} from "../../../models/Store/Vendor/index.js";
import { AcademicDiscipline } from "../../../models/AcademicDiscipline/index.js";

// @desc    Public: Get published eBooks filtered by academic discipline (only from Active vendor accounts)
// @route   GET /api/lms/lockedPublishedEbooks?academicDiscipline=ID&page=1&limit=10
// @access  Public
export const getLockedPublishedEbooksPublic = async (req, res) => {
  try {
    const { academicDiscipline, page = 1, limit = 10 } = req.query;

    // Build match stage
    const matchStage = { status: "Active" };
    if (academicDiscipline) {
      matchStage.academicDiscipline = academicDiscipline;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.max(parseInt(limit, 10) || 10, 1);

    // Aggregation: match published ebooks, lookup vendor and ensure vendor is Active
    const pipeline = [
      { $match: matchStage },
      // Lookup vendor by comparing stringified _id to stored vendorId
      {
        $lookup: {
          from: "storevendors",
          let: { vid: "$vendorId" },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$vid"] } } },
            { $match: { accountStatus: "Active" } },
            { $project: { _id: 1, vendorId: 1, accountStatus: 1 } },
          ],
          as: "vendorInfo",
        },
      },
      // Only include ebooks where vendorInfo is not empty (i.e., vendor exists and is Active)
      { $match: { vendorInfo: { $ne: [] } } },
      // Sort newest first
      { $sort: { createdAt: -1 } },
      // Pagination
      { $skip: (pageNum - 1) * perPage },
      { $limit: perPage },
      // Project fields to return
      {
        $project: {
          _id: 1,
          publishId: 1,
          ebookId: 1,
          academicDiscipline: 1,
          ebookTitle: 1,
          author: 1,
          publisher: 1,
          publishedDate: 1,
          isbn: 1,
          language: 1,
          synopsis: 1,
          ebookCover: 1,
          ebookContent: 1,
          salePrice: 1,
          makeAvailableForBorrow: 1,
          borrowFee: 1,
          borrowPeriod: 1,
          dateListed: 1,
          vendorId: 1,
        },
      },
    ];

    const data = await PublishedEbook.aggregate(pipeline).allowDiskUse(true);

    // total count (only for given discipline and active vendors)
    const countPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "storevendors",
          let: { vid: "$vendorId" },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$vid"] } } },
            { $match: { accountStatus: "Active" } },
            { $project: { _id: 1 } },
          ],
          as: "vendorInfo",
        },
      },
      { $match: { vendorInfo: { $ne: [] } } },
      { $count: "total" },
    ];

    const countResult = await PublishedEbook.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    return res.status(200).json({
      success: true,
      message: "Published eBooks fetched successfully.",
      page: pageNum,
      limit: perPage,
      total,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching public locked published eBooks:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error: " + error.message,
      });
  }
};
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

export const getAllLockedBookCovers = async (req, res) => {
  try {
    // Fetch all locked book covers from all vendors
    const lockedCovers = await StoreVendoreBookCover.find({ isLocked: true });

    if (!lockedCovers || lockedCovers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No locked eBook covers found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Locked book covers fetched successfully.",
      count: lockedCovers.length,
      data: lockedCovers,
    });
  } catch (error) {
    console.error("Error fetching locked book covers:", error);
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

    // Generate unique Publish ID (PUB + 12 random numbers)
    const publishId = generateIds("PUB", 12, false);

    // Create the eBook
    const newEbook = await PublishedEbook.create({
      vendorId,
      publishId,
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
      status: "Active",
      dateListed: new Date(),
    });

    await newEbook.save();

    // Format the date for response
    const formattedDate = new Date().toISOString().split("T")[0];

    return res.status(201).json({
      success: true,
      message:
        "Congratulations! Your eBook has been successfully published on eHandout Books.",
      data: {
        publishId: newEbook.publishId,
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

export const getActiveAcademicDisciplines = async (req, res) => {
  try {
    // Fetch all academic disciplines with status "Active" or "active" (case-insensitive)
    const activeDisciplines = await AcademicDiscipline.find({
      status: { $regex: /^active$/i },
    }).sort({ name: 1 }); // Sort alphabetically by name

    console.log("Found disciplines:", activeDisciplines.length);

    if (!activeDisciplines || activeDisciplines.length === 0) {
      // Check if any disciplines exist at all
      const totalCount = await AcademicDiscipline.countDocuments();
      console.log("Total disciplines in DB:", totalCount);

      return res.status(404).json({
        success: false,
        message: "No active academic disciplines found.",
        debug: {
          totalInDatabase: totalCount,
          hint: "Check if status field is 'Active' (capital A)",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Active academic disciplines fetched successfully.",
      count: activeDisciplines.length,
      data: activeDisciplines,
    });
  } catch (error) {
    console.error("Error fetching academic disciplines:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Get all locked eBooks from all vendors
// @route   GET /api/store/vendor/lockedEbooks
// @access  Private (JWT)
export const getAllLockedEbooks = async (req, res) => {
  try {
    // Fetch all eBooks with isLocked = true
    const lockedEbooks = await VendorEbook.find({ isLocked: true })
      .select("vendorId bookId bookName bookURL isLocked createdAt updatedAt")
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log("Found locked eBooks:", lockedEbooks.length);

    if (!lockedEbooks || lockedEbooks.length === 0) {
      // Check if any eBooks exist at all
      const totalCount = await VendorEbook.countDocuments();
      console.log("Total eBooks in DB:", totalCount);

      return res.status(404).json({
        success: false,
        message: "No locked eBooks found.",
        debug: {
          totalInDatabase: totalCount,
          hint: "Check if any eBooks have isLocked: true",
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Locked eBooks fetched successfully.",
      count: lockedEbooks.length,
      data: lockedEbooks,
    });
  } catch (error) {
    console.error("Error fetching locked eBooks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Get all published eBooks for the logged-in vendor
// @route   GET /api/store/vendor/myPublishedEbooks
// @access  Private (JWT)
export const getMyPublishedEbooks = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token

    // Fetch all published eBooks for this vendor
    const publishedEbooks = await PublishedEbook.find({ vendorId })
      .select(
        "publishId ebookId academicDiscipline ebookTitle author publisher isbn language ebookCover salePrice makeAvailableForBorrow borrowFee borrowPeriod status dateListed createdAt updatedAt",
      )
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log(
      `Found ${publishedEbooks.length} published eBooks for vendor ${vendorId}`,
    );

    if (!publishedEbooks || publishedEbooks.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You haven't published any eBooks yet.",
      });
    }

    // Populate academic discipline names
    const ebooksWithDisciplineNames = await Promise.all(
      publishedEbooks.map(async (ebook) => {
        // Try to find by _id (MongoDB ObjectId) first
        let discipline = await AcademicDiscipline.findById(
          ebook.academicDiscipline,
        );

        // If not found, try by disciplineId field
        if (!discipline) {
          discipline = await AcademicDiscipline.findOne({
            disciplineId: ebook.academicDiscipline,
          });
        }

        // If still not found, try by name
        if (!discipline) {
          discipline = await AcademicDiscipline.findOne({
            name: { $regex: new RegExp(`^${ebook.academicDiscipline}$`, "i") },
          });
        }

        return {
          ...ebook.toObject(),
          academicDisciplineName: discipline
            ? discipline.name
            : ebook.academicDiscipline,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      message: "Published eBooks fetched successfully.",
      count: ebooksWithDisciplineNames.length,
      data: ebooksWithDisciplineNames,
    });
  } catch (error) {
    console.error("Error fetching published eBooks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Get detailed information of a single published eBook by ID
// @route   GET /api/store/vendor/publishedEbook/:ebookId
// @access  Private (JWT)
export const getPublishedEbookById = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token
    const { ebookId } = req.params; // Get eBook ID from URL parameter

    // Fetch the eBook by ID
    const ebook = await PublishedEbook.findById(ebookId);

    if (!ebook) {
      return res.status(404).json({
        success: false,
        message: "eBook not found.",
      });
    }

    // Check if this eBook belongs to the logged-in vendor
    if (ebook.vendorId !== vendorId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this eBook.",
      });
    }

    // Lookup academic discipline name
    let discipline = await AcademicDiscipline.findById(
      ebook.academicDiscipline,
    );

    if (!discipline) {
      discipline = await AcademicDiscipline.findOne({
        disciplineId: ebook.academicDiscipline,
      });
    }

    if (!discipline) {
      discipline = await AcademicDiscipline.findOne({
        name: { $regex: new RegExp(`^${ebook.academicDiscipline}$`, "i") },
      });
    }

    // Prepare the response with discipline name
    const ebookDetails = {
      ...ebook.toObject(),
      academicDisciplineName: discipline
        ? discipline.name
        : ebook.academicDiscipline,
    };

    return res.status(200).json({
      success: true,
      message: "eBook details fetched successfully.",
      data: ebookDetails,
    });
  } catch (error) {
    console.error("Error fetching eBook details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Update a published eBook (only editable fields)
// @route   PUT /api/store/vendor/publishedEbook/:ebookId
// @access  Private (JWT)
export const updatePublishedEbook = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token
    const { ebookId } = req.params; // Get eBook ID from URL parameter
    const { status, aboutAuthor, academicRecommendation, publicDomain } =
      req.body;

    // Validate required fields
    if (!status || !aboutAuthor || !academicRecommendation || !publicDomain) {
      return res.status(400).json({
        success: false,
        message: "All editable fields are required.",
        errors: {
          status: !status ? "Status is required" : undefined,
          aboutAuthor: !aboutAuthor ? "About Author is required" : undefined,
          academicRecommendation: !academicRecommendation
            ? "Academic recommendation is required"
            : undefined,
          publicDomain: !publicDomain ? "Public domain is required" : undefined,
        },
      });
    }

    // Validate status enum
    const validStatuses = ["Active", "Suspend", "Reinstate", "Republish"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: {
          status: `Invalid status value. Must be one of: ${validStatuses.join(", ")}`,
        },
      });
    }

    // Validate academicRecommendation
    if (!["yes", "no"].includes(academicRecommendation)) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: {
          academicRecommendation:
            "Academic recommendation must be 'yes' or 'no'",
        },
      });
    }

    // Validate publicDomain
    if (!["yes", "no"].includes(publicDomain)) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: {
          publicDomain: "Public domain must be 'yes' or 'no'",
        },
      });
    }

    // Find the eBook first
    const ebook = await PublishedEbook.findById(ebookId);

    if (!ebook) {
      return res.status(404).json({
        success: false,
        message: "eBook not found.",
      });
    }

    // Check if this eBook belongs to the logged-in vendor
    if (ebook.vendorId !== vendorId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this eBook.",
      });
    }

    // Update only the editable fields
    const allowedUpdates = {
      status,
      aboutAuthor,
      academicRecommendation,
      publicDomain,
    };

    const updatedEbook = await PublishedEbook.findByIdAndUpdate(
      ebookId,
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    );

    // Lookup academic discipline name for response
    let discipline = await AcademicDiscipline.findById(
      updatedEbook.academicDiscipline,
    );

    if (!discipline) {
      discipline = await AcademicDiscipline.findOne({
        disciplineId: updatedEbook.academicDiscipline,
      });
    }

    if (!discipline) {
      discipline = await AcademicDiscipline.findOne({
        name: {
          $regex: new RegExp(`^${updatedEbook.academicDiscipline}$`, "i"),
        },
      });
    }

    // Prepare the response with discipline name
    const ebookDetails = {
      ...updatedEbook.toObject(),
      academicDisciplineName: discipline
        ? discipline.name
        : updatedEbook.academicDiscipline,
    };

    console.log(
      `eBook ${ebookId} updated by vendor ${vendorId}. Status: ${status}`,
    );

    return res.status(200).json({
      success: true,
      message: "eBook updated successfully.",
      data: ebookDetails,
    });
  } catch (error) {
    console.error("Error updating eBook:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Submit vendor testimonial
// @route   POST /api/store/vendor/testimonial
// @access  Private (JWT)
export const submitTestimonial = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token
    const { rating, testimonial, screenName, consentToQuote } = req.body;

    // Validate required fields
    if (
      !rating ||
      !testimonial ||
      !screenName ||
      consentToQuote === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
        errors: {
          rating: !rating ? "Rating is required" : undefined,
          testimonial: !testimonial ? "Testimonial is required" : undefined,
          screenName: !screenName ? "Screen name is required" : undefined,
          consentToQuote:
            consentToQuote === undefined ? "Consent is required" : undefined,
        },
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    // Validate testimonial length
    if (testimonial.length > 300) {
      return res.status(400).json({
        success: false,
        message: "Testimonial must not exceed 300 characters.",
      });
    }

    // Validate screen name length
    if (screenName.length > 25) {
      return res.status(400).json({
        success: false,
        message: "Screen name must not exceed 25 characters.",
      });
    }

    // Validate consent
    if (consentToQuote !== true) {
      return res.status(400).json({
        success: false,
        message:
          "You must agree that your testimonial may be quoted on the eHandout platforms.",
      });
    }

    // Check vendor account status - use _id from token
    const vendor = await StoreVendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    // Determine status based on vendor account status
    let testimonialStatus = "Pending";
    if (vendor.accountStatus === "Suspended") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is suspended. You cannot submit testimonials at this time.",
      });
    }

    if (vendor.accountStatus === "Active") {
      testimonialStatus = "Pending"; // Will be reviewed by admin
    }

    // Create testimonial - use vendor.vendorId from the found vendor
    const newTestimonial = await VendorTestimonial.create({
      vendorId: vendor.vendorId,
      rating,
      testimonial,
      screenName,
      consentToQuote,
      status: testimonialStatus,
    });

    await newTestimonial.save();

    return res.status(201).json({
      success: true,
      message: "Your rating and testimonial have been submitted successfully.",
      data: {
        id: newTestimonial._id,
        rating: newTestimonial.rating,
        testimonial: newTestimonial.testimonial,
        screenName: newTestimonial.screenName,
        status: newTestimonial.status,
        createdAt: newTestimonial.createdAt,
      },
    });
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Change vendor password
// @route   PUT /api/store/vendor/changePassword
// @access  Private (JWT)
export const changePassword = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validate new password length (minimum 8 characters)
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Your Password must be at least 8 characters long.",
      });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match.",
      });
    }

    // Find vendor by ID
    const vendor = await StoreVendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, vendor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    vendor.password = hashedPassword;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Your password has been changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Toggle Two-Factor Authentication and send verification code
// @route   POST /api/store/vendor/toggleTwoFactor
// @access  Private (JWT)
export const toggleTwoFactorAuth = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token
    const { enable } = req.body; // true to enable, false to disable

    if (enable === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please specify whether to enable or disable 2FA.",
      });
    }

    // Find vendor by ID
    const vendor = await StoreVendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    if (enable) {
      // Generate 4-digit verification code
      const verificationCode = Math.floor(1000 + Math.random() * 9000);
      const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      vendor.twoFactorCode = verificationCode;
      vendor.twoFactorCodeExpiry = codeExpiry;
      await vendor.save();

      // TODO: Send verification code to vendor email
      console.log(`2FA Code for ${vendor.email}: ${verificationCode}`);

      return res.status(200).json({
        success: true,
        message: `A verification code has been sent to ${vendor.email}. Please check your inbox, enter the code below, and then click 'Verify'`,
        code: verificationCode, // Remove in production
      });
    } else {
      // Disable 2FA
      vendor.twoFactorEnabled = false;
      vendor.twoFactorCode = null;
      vendor.twoFactorCodeExpiry = null;
      await vendor.save();

      return res.status(200).json({
        success: true,
        message: "Two-Factor Authentication has been disabled.",
      });
    }
  } catch (error) {
    console.error("Error toggling 2FA:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Logout vendor (invalidate current JWT)
// @route   POST /api/store/vendor/logout
// @access  Private (JWT)
export const logoutVendor = async (req, res) => {
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
    console.error("Error during logout:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Verify Two-Factor Authentication code
// @route   POST /api/store/vendor/verifyTwoFactor
// @access  Private (JWT)
export const verifyTwoFactorCode = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required.",
      });
    }

    // Find vendor by ID
    const vendor = await StoreVendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    // Check if code exists
    if (!vendor.twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new code.",
      });
    }

    // Check if code expired
    if (vendor.twoFactorCodeExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    // Verify code
    if (vendor.twoFactorCode !== parseInt(code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    // Enable 2FA and clear verification code
    vendor.twoFactorEnabled = true;
    vendor.twoFactorCode = null;
    vendor.twoFactorCodeExpiry = null;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Two-Factor Authentication has been enabled successfully.",
    });
  } catch (error) {
    console.error("Error verifying 2FA code:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Get Two-Factor Authentication status and Inactive Timeout
// @route   GET /api/store/vendor/twoFactorStatus
// @access  Private (JWT)
export const getTwoFactorStatus = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token

    // Find vendor by ID
    const vendor = await StoreVendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Security settings retrieved successfully.",
      data: {
        twoFactorEnabled: vendor.twoFactorEnabled || false,
        inactiveTimeout: vendor.inactiveTimeout || 30,
      },
    });
  } catch (error) {
    console.error("Error fetching security settings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Set inactive timeout setting
// @route   PUT /api/store/vendor/inactiveTimeout
// @access  Private (JWT)
export const setInactiveTimeout = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token
    const { timeoutMinutes } = req.body;

    // Validate timeout value
    if (!timeoutMinutes || timeoutMinutes < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid timeout value (minimum 1 minute).",
      });
    }

    // Recommended minimum is 30 minutes
    if (timeoutMinutes < 30) {
      return res.status(400).json({
        success: false,
        message: "Please set the default session inactive timeout to 30mins",
      });
    }

    // Find vendor by ID
    const vendor = await StoreVendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    // Update inactive timeout setting
    vendor.inactiveTimeout = timeoutMinutes;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: "Your inactive timeout setting has been saved successfully",
      data: {
        timeoutMinutes: vendor.inactiveTimeout,
      },
    });
  } catch (error) {
    console.error("Error setting inactive timeout:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Submit contact message to eHandout
// @route   POST /api/store/vendor/contact
// @access  Private (JWT)
export const submitContactMessage = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token
    const { messageCategory, message } = req.body;

    // Validate required fields
    if (!messageCategory || !messageCategory.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please select a message category.",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your message.",
      });
    }

    // Validate message length
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters.",
      });
    }

    // Find vendor to get email and vendorId
    const vendor = await StoreVendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    // Check if vendor account is suspended
    if (vendor.accountStatus === "Suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended. Please contact support.",
      });
    }

    // Create contact message
    const contactMessage = new VendorContact({
      vendorId: vendor.vendorId,
      email: vendor.email,
      messageCategory: messageCategory.trim(),
      message: message.trim(),
      status: "Pending",
    });

    await contactMessage.save();

    return res.status(201).json({
      success: true,
      message:
        "Thank you for reaching out to The eHandout Team. We will endeavor to respond promptly to your inquiry.",
      data: {
        id: contactMessage._id,
        messageCategory: contactMessage.messageCategory,
        message: contactMessage.message,
        status: contactMessage.status,
        createdAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Get vendor dashboard information
// @route   GET /api/store/vendor/dashboard
// @access  Private (JWT)
export const getVendorDashboard = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // Get vendor ID from token

    // Find vendor basic information
    const vendor = await StoreVendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor account not found.",
      });
    }

    // Find vendor detailed information - try both MongoDB _id and custom vendorId
    let vendorInfo = await StoreVendorInformation.findOne({
      vendorId: vendor.vendorId,
    });

    // If not found by custom vendorId, try by MongoDB _id
    if (!vendorInfo) {
      vendorInfo = await StoreVendorInformation.findOne({
        vendorId: vendorId,
      });
    }

    // Prepare dashboard data
    const dashboardData = {
      vendorId: vendor.vendorId,
      vendorName: vendorInfo ? vendorInfo.vendorName : "N/A",
      accountType: vendorInfo ? vendorInfo.accountType : "N/A",
      emailAddress: vendor.email,
      emailVerified: vendor.emailVerified,
      country: vendorInfo ? vendorInfo.country : vendor.country,
      city: vendorInfo ? vendorInfo.city : "N/A",
      phoneNumber: `${vendor.phoneCode}${vendor.mobile}`,
      phoneVerified: vendor.mobileVerified,
      accountStatus: vendor.accountStatus,
      accountCreatedOn: vendor.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "Vendor dashboard information retrieved successfully.",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching vendor dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Get all vendor tutorials
// @route   GET /api/store/vendor/tutorials
// @access  Private (JWT)
export const getVendorTutorials = async (req, res) => {
  try {
    // Fetch all tutorials from the collection
    const tutorials = await VendorTutorial.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Vendor tutorials retrieved successfully.",
      count: tutorials.length,
      data: tutorials,
    });
  } catch (error) {
    console.error("Error fetching vendor tutorials:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};

// @desc    Submit a consultation request (free eBook publishing consultation)
// @route   POST /api/store/vendor/consultation
// @access  Private (JWT)
export const submitConsultationRequest = async (req, res) => {
  try {
    const { id: vendorId } = req.vendor; // token contains Mongo _id
    const { message, preferredContactMethod, phone } = req.body;

    // Basic validation
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // Find vendor to get email and custom vendorId
    const vendor = await StoreVendor.findById(vendorId);
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor account not found." });
    }

    if (vendor.accountStatus === "Suspended") {
      return res.status(403).json({
        success: false,
        message: "Your account is suspended. Cannot submit requests.",
      });
    }

    // Create consultation request
    const consultation = new VendorConsultation({
      vendorId: vendor.vendorId || vendorId,
      email: vendor.email,
      phone: phone || `${vendor.phoneCode}${vendor.mobile}`,
      preferredContactMethod: preferredContactMethod || "email",
      message: message.trim(),
      status: "Pending",
    });

    await consultation.save();

    return res.status(201).json({
      success: true,
      message:
        "Your request has been sent successfully. One of our staff will contact you shortly.",
      data: {
        id: consultation._id,
        status: consultation.status,
        createdAt: consultation.createdAt,
      },
    });
  } catch (error) {
    console.error("Error submitting consultation request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};
