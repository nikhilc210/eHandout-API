# Quick Start Guide - Publish eBook API

## Prerequisites Checklist

Before you can publish an eBook, ensure:

- [ ] MongoDB is running
- [ ] Server is started (`node server/index.js`)
- [ ] You have registered as a vendor
- [ ] You have verified your email (OTP)
- [ ] You have logged in and have a JWT token
- [ ] You have completed Vendor Information
- [ ] You have completed Bank Information
- [ ] You have created and locked an eBook cover

## Step-by-Step Testing Guide

### Step 1: Start the Server

```bash
cd server
node index.js
```

Expected output:
```
🚀 Server running in development mode on port 5001
MongoDB Connected: <your-connection-string>
```

### Step 2: Register a Vendor

```bash
curl -X POST http://localhost:5001/api/store/vendor/register \
  -H "Content-Type: application/json" \
  -d '{
    "country": "Nigeria",
    "email": "vendor@example.com",
    "phoneCode": "+234",
    "mobile": "8012345678",
    "password": "SecurePass123!"
  }'
```

Save the OTP from the response.

### Step 3: Verify OTP

```bash
curl -X POST http://localhost:5001/api/store/vendor/verifyOtp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "otp": "123456"
  }'
```

Save the JWT token from the response: `"token": "eyJhbGci..."`

### Step 4: Complete Vendor Information

```bash
curl -X POST http://localhost:5001/api/store/vendor/vendorInformation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "accountType": "Individual",
    "vendorType": "Author",
    "vendorName": "John Doe Publishing",
    "tin": "123456789",
    "address": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos State",
    "country": "Nigeria",
    "identityType": "Driver License",
    "dateOfIssue": "2020-01-01",
    "expiryDate": "2030-01-01",
    "identityFile": "https://s3.amazonaws.com/your-bucket/identity.pdf"
  }'
```

### Step 5: Complete Bank Information

```bash
curl -X POST http://localhost:5001/api/store/vendor/vendorBankInformation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bankCountry": "Nigeria",
    "bankBranchState": "Lagos",
    "bankCurrency": "NGN",
    "bankName": "First Bank of Nigeria",
    "bankBranchName": "Victoria Island Branch",
    "bankBranchCode": "011234567",
    "swiftBicCode": "FBNINGLA",
    "accountNumber": "1234567890",
    "accountHolderName": "John Doe",
    "accountType": "Savings",
    "routingNumber": "",
    "sortCode": ""
  }'
```

### Step 6: Create eBook Cover

```bash
curl -X POST http://localhost:5001/api/store/vendor/vendoreBookCover \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "coverName": "JavaScript Book Cover",
    "coverURL": "https://s3.amazonaws.com/your-bucket/cover.jpg"
  }'
```

### Step 7: Lock the Cover (Update)

First, get all covers to find the ID:

```bash
curl -X GET http://localhost:5001/api/store/vendor/vendoreBookCover \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Then lock it (save the `_id` from the response):

```bash
curl -X PUT http://localhost:5001/api/store/vendor/vendoreBookCover \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "coverId": "65f25ab52b4c29cf69ee2401bbe",
    "coverName": "JavaScript Book Cover",
    "isLocked": true,
    "coverURL": "https://s3.amazonaws.com/your-bucket/cover.jpg"
  }'
```

### Step 8: Publish the eBook! 🎉

```bash
curl -X POST http://localhost:5001/api/store/vendor/publishEbook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "academicDiscipline": "Computer Science",
    "ebookTitle": "Introduction to JavaScript Programming",
    "author": "John Doe",
    "publisher": "John Doe Publishing",
    "publishedDate": "2026-01-15",
    "edition": "2nd Edition",
    "series": "Web Development Series",
    "isbn": "978-3-16-148410-0",
    "language": "English",
    "synopsis": "A comprehensive guide to JavaScript programming for beginners and intermediate developers.",
    "aboutAuthor": "John Doe is a senior software engineer with over 10 years of experience.",
    "academicRecommendation": "yes",
    "publicDomain": "no",
    "ebookCover": "65f25ab52b4c29cf69ee2401bbe",
    "ebookContent": "65f25ab52b4c29cf69ee2401bbf",
    "salePrice": 8000,
    "makeAvailableForBorrow": true,
    "borrowFee": 500,
    "borrowPeriod": 14,
    "legalAuthorization": true
  }'
```

### Expected Success Response

```json
{
  "success": true,
  "message": "eBook published successfully",
  "data": {
    "ebookId": "ENG123456789012",
    "status": "Pending Review",
    "dateListed": "2026-01-23"
  }
}
```

## Common Issues & Solutions

### Issue: "Vendor Information not available"
**Solution**: Complete Step 4 - Submit vendor information first

### Issue: "Bank Information not available"
**Solution**: Complete Step 5 - Submit bank information first

### Issue: "Invalid eBook cover ID"
**Solution**: 
- Verify the cover ID is correct (use GET endpoint to list covers)
- Ensure the cover belongs to your vendor account

### Issue: "Please lock the eBook cover before publishing"
**Solution**: Update the cover with `"isLocked": true` (Step 7)

### Issue: "Invalid ISBN format"
**Solution**: Use valid ISBN-10 or ISBN-13:
- ISBN-10: `0-123456-78-9` (10 characters)
- ISBN-13: `978-3-16-148410-0` (13 digits)

### Issue: "borrowFee and borrowPeriod are required"
**Solution**: If `makeAvailableForBorrow` is true, include:
```json
{
  "makeAvailableForBorrow": true,
  "borrowFee": 500,
  "borrowPeriod": 14
}
```

### Issue: "Unauthorized" or "Token invalid"
**Solution**: 
- Verify your JWT token is correct
- Token might be expired (re-login to get new token)
- Ensure you include the "Bearer " prefix in Authorization header

## Testing with Postman

1. Import the collection: `postman_collection_publish_ebook.json`
2. Set environment variables:
   - `BASE_URL`: `http://localhost:5001`
   - `JWT_TOKEN`: Your actual JWT token
3. Run the requests in order

## Database Verification

Check if the eBook was created:

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use ehandout

# Find the published eBook
db.vendorebooks.find().pretty()
```

## Next Steps

After publishing:
1. eBook status will be "Pending Review"
2. Admin will review and approve
3. Status will change to "Ready For Sale"
4. eBook will appear in the marketplace

## Support

If you encounter issues:
1. Check server logs for error details
2. Verify MongoDB connection
3. Ensure all prerequisites are met
4. Review the full API documentation: `PUBLISH_EBOOK_API.md`

## Validation Quick Reference

| Field | Required | Format | Example |
|-------|----------|--------|---------|
| academicDiscipline | ✅ | String | "Computer Science" |
| ebookTitle | ✅ | String | "Intro to JS" |
| author | ✅ | String | "John Doe" |
| publisher | ✅ | String | "Tech Books" |
| publishedDate | ✅ | String | "2026-01-15" |
| edition | ❌ | String | "2nd Edition" |
| series | ❌ | String | "Web Dev Series" |
| isbn | ✅ | ISBN-10/13 | "978-3-16-148410-0" |
| language | ✅ | String | "English" |
| synopsis | ✅ | String | "A guide to..." |
| aboutAuthor | ✅ | String | "John is..." |
| academicRecommendation | ✅ | "yes"/"no" | "yes" |
| publicDomain | ✅ | "yes"/"no" | "no" |
| ebookCover | ✅ | Cover ID | "65f25..." |
| ebookContent | ✅ | Content ID | "65f25..." |
| salePrice | ✅ | Number/String | 8000 or "8,000" |
| makeAvailableForBorrow | ❌ | Boolean | true |
| borrowFee | ⚠️* | Number/String | 500 |
| borrowPeriod | ⚠️* | Number | 14 |
| legalAuthorization | ✅ | Boolean (true) | true |

⚠️* Required if `makeAvailableForBorrow` is true

---

Happy Publishing! 📚✨
