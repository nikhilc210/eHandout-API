import mongoose from "mongoose";
const storeVendorSignupSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String, required: true },
    phoneCode: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    otp: { type: Number },
    otpExpiry: { type: Date },
    mobileVerified: { type: Boolean, default: false },
    accountStatus: {
      type: String,
      enum: ["Pending", "Active", "Suspended"],
      default: "Pending",
    },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: Number },
    twoFactorCodeExpiry: { type: Date },
    inactiveTimeout: { type: Number, default: 30 }, // in minutes
  },
  { timestamps: true },
);

const storeVendorInformationSchema = new mongoose.Schema(
  {
    vendorId: { type: String, require: true },
    accountType: {
      type: String,
      enum: ["Individual", "Company"],
      default: "Individual",
      required: true,
    },
    vendorType: {
      type: String,
      enum: ["Publisher", "Author"],
      required: true,
    },
    vendorName: { type: String, required: true },
    tin: { type: String, required: false },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    identityType: {
      type: String,
      enum: [
        "Driver License",
        "International Passport",
        "Government-issued Id",
        "National Identifications Number",
        "Parmanent Votor's Card",
        "Residence/Work Permit",
      ],
      required: true,
    },
    dateOfIssue: { type: String, required: true },
    expiryDate: { type: String, required: true },
    identityFile: { type: String, required: true },
  },
  { timestamps: true },
);

const storeVendorBankInformationSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    bankCountry: { type: String, required: true },
    bankBranchState: { type: String, required: true },
    bankCurrency: { type: String, required: true },
    bankName: { type: String, required: true },
    bankBranchName: { type: String, required: true },
    bankBranchCode: { type: String, required: true },
    swiftBicCode: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    accountType: { type: String },
    routingNumber: { type: String },
    sortCode: { type: String },
  },
  { timestamps: true },
);

const storeVendoreBookCoverSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    coverId: { type: String, required: true },
    coverName: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
    coverURL: { type: String, required: true },
  },
  { timestamps: true },
);

// Simple schema for locked books
const vendorEbookSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    bookId: { type: String, required: true },
    bookName: { type: String, required: true },
    bookURL: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Full schema for published eBooks
const publishedEbookSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    publishId: { type: String, required: true, unique: true }, // PUB + 12 digits
    ebookId: { type: String, required: true, unique: true },
    academicDiscipline: { type: String, required: true },
    ebookTitle: { type: String, required: true },
    author: { type: String, required: true },
    publisher: { type: String, required: true },
    publishedDate: { type: String, required: true },
    edition: { type: String },
    series: { type: String },
    isbn: { type: String, required: true },
    language: { type: String, required: true },
    synopsis: { type: String, required: true },
    aboutAuthor: { type: String, required: true },
    academicRecommendation: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
    publicDomain: { type: String, enum: ["yes", "no"], required: true },
    ebookCover: { type: String, required: true }, // Cover URL
    ebookContent: { type: String, required: true }, // Content URL
    salePrice: { type: Number, required: true },
    makeAvailableForBorrow: { type: Boolean, default: false },
    borrowFee: { type: Number },
    borrowPeriod: { type: Number }, // in days
    legalAuthorization: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["Active", "Suspend", "Reinstate", "Republish"],
      default: "Active",
    },
    dateListed: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const StoreVendor = mongoose.model("StoreVendor", storeVendorSignupSchema);
const StoreVendorInformation = mongoose.model(
  "StoreVendorInformation",
  storeVendorInformationSchema,
);
const StoreVendorBankInformation = mongoose.model(
  "storeVendorBankInformation",
  storeVendorBankInformationSchema,
);
const StoreVendoreBookCover = mongoose.model(
  "storeVendoreBookCover",
  storeVendoreBookCoverSchema,
);
const VendorEbook = mongoose.model(
  "VendorEbook",
  vendorEbookSchema,
  "storeVendorEbook", // Explicit collection name for locked books
);
const PublishedEbook = mongoose.model(
  "PublishedEbook",
  publishedEbookSchema,
  "publishedebooks", // Collection name for full published eBooks
);

// Vendor Testimonial Schema
const vendorTestimonialSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    testimonial: { type: String, required: true, maxlength: 300 },
    screenName: { type: String, required: true, maxlength: 25 },
    consentToQuote: { type: Boolean, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

const VendorTestimonial = mongoose.model(
  "VendorTestimonial",
  vendorTestimonialSchema,
  "vendortestimonials",
);

// Schema for vendor contact messages to eHandout
const vendorContactSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    email: { type: String, required: true },
    messageCategory: { type: String, required: true },
    message: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },
    response: { type: String },
    respondedAt: { type: Date },
  },
  { timestamps: true },
);

const VendorContact = mongoose.model(
  "VendorContact",
  vendorContactSchema,
  "vendorcontacts",
);

// Schema for vendor tutorials
const vendorTutorialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true },
);

const VendorTutorial = mongoose.model(
  "VendorTutorial",
  vendorTutorialSchema,
  "vendorTutorials",
);

// Schema for vendor consultation requests (free eBook publishing consultation)
const vendorConsultationSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true }, // can be custom vendorId or Mongo _id string
    email: { type: String, required: true },
    phone: { type: String },
    preferredContactMethod: {
      type: String,
      enum: ["email", "phone"],
      default: "email",
    },
    message: { type: String, required: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Closed"],
      default: "Pending",
    },
    respondedAt: { type: Date },
    response: { type: String },
  },
  { timestamps: true },
);

const VendorConsultation = mongoose.model(
  "VendorConsultation",
  vendorConsultationSchema,
  "vendorconsultations",
);

// Schema for invalidated JWT tokens (logout blacklist)
const invalidatedTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const InvalidatedToken = mongoose.model(
  "InvalidatedToken",
  invalidatedTokenSchema,
  "invalidatedtokens",
);

export {
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
};
