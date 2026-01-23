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
  },
  { timestamps: true }
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
  { timestamps: true }
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
  { timestamps: true }
);

const storeVendoreBookCoverSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    coverId: { type: String, required: true },
    coverName: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
    coverURL: { type: String, required: true },
  },
  { timestamps: true }
);

const StoreVendor = mongoose.model("StoreVendor", storeVendorSignupSchema);
const StoreVendorInformation = mongoose.model(
  "StoreVendorInformation",
  storeVendorInformationSchema
);
const StoreVendorBankInformation = mongoose.model(
  "storeVendorBankInformation",
  storeVendorBankInformationSchema
);
const StoreVendoreBookCover = mongoose.model(
  "storeVendoreBookCover",
  storeVendoreBookCoverSchema
);
export {
  StoreVendor,
  StoreVendorInformation,
  StoreVendorBankInformation,
  StoreVendoreBookCover,
};
