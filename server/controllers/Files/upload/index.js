import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../../config/s3.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Upload file to S3 under ehandout-nigeria-images/vendor_identities/
 */
export const uploadVendorIdentity = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const file = req.file;
    const vendorId = req.body.vendorId || "unknown"; // in case you want to group by vendor
    const fileName = `${Date.now()}-${file.originalname}`;

    // ✅ Construct the path where file should be stored
    const key = `${process.env.AWS_NIGERIA_VENDOR_ID_PATH}${fileName}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({
      success: true,
      message: "Vendor identity uploaded successfully",
      fileUrl,
    });
  } catch (error) {
    console.error("S3 Upload Error:", error);
    res.status(500).json({ success: false, message: "Upload failed", error });
  }
};
