# Publish eBook API Documentation

## Endpoint
```
POST /api/store/vendor/publishEbook
```

## Authentication
**Required**: Yes (JWT token from logged-in vendor)

Add token to request headers:
```
Authorization: Bearer <your-jwt-token>
```

## Request Body

```json
{
  "academicDiscipline": "Computer Science",
  "ebookTitle": "Introduction to JavaScript",
  "author": "John Doe",
  "publisher": "Tech Books Publishing",
  "publishedDate": "2026-01-15",
  "edition": "2nd Edition",
  "series": "Web Development Series",
  "isbn": "978-3-16-148410-0",
  "language": "English",
  "synopsis": "A comprehensive guide to JavaScript programming for beginners and intermediate developers.",
  "aboutAuthor": "John Doe is a software engineer with 10 years of experience in web development.",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "https://s3.amazonaws.com/your-bucket/covers/js-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/your-bucket/ebooks/js-book.pdf",
  "salePrice": 8000,
  "makeAvailableForBorrow": true,
  "borrowFee": 500,
  "borrowPeriod": 14,
  "legalAuthorization": true
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `academicDiscipline` | string | Yes | Academic category/discipline of the eBook |
| `ebookTitle` | string | Yes | Title of the eBook |
| `author` | string | Yes | Author name(s) |
| `publisher` | string | Yes | Publisher name |
| `publishedDate` | string | Yes | Original publication date |
| `edition` | string | No | Edition information |
| `series` | string | No | Series name if applicable |
| `isbn` | string | Yes | Valid ISBN-10 or ISBN-13 |
| `language` | string | Yes | Primary language of the eBook |
| `synopsis` | string | Yes | Brief description/summary |
| `aboutAuthor` | string | Yes | Author biography |
| `academicRecommendation` | string | Yes | "yes" or "no" |
| `publicDomain` | string | Yes | "yes" or "no" |
| `ebookCover` | string | Yes | HTTP/HTTPS URL to cover image |
| `ebookContent` | string | Yes | HTTP/HTTPS URL to eBook file |
| `salePrice` | number | Yes | Sale price in NGN (accepts commas, e.g., "8,000") |
| `makeAvailableForBorrow` | boolean | No | Default: false |
| `borrowFee` | number | Conditional* | Borrow fee in NGN (required if makeAvailableForBorrow is true) |
| `borrowPeriod` | number | Conditional* | Borrow period in days (required if makeAvailableForBorrow is true) |
| `legalAuthorization` | boolean | Yes | Must be `true` to publish |

\* Required when `makeAvailableForBorrow` is `true`

## Validation Rules

1. **Required Fields**: All fields marked as required must be present
2. **Legal Authorization**: `legalAuthorization` must be `true`
3. **Borrow Settings**: If `makeAvailableForBorrow` is `true`, then `borrowFee` and `borrowPeriod` are required
4. **Price Validation**:
   - `salePrice` must be a positive number
   - `borrowFee` (if provided) must be a positive number
   - Accepts comma-formatted prices (e.g., "8,000")
5. **ISBN Validation**: Must be a valid ISBN-10 or ISBN-13 format
6. **Enum Values**:
   - `academicRecommendation`: must be "yes" or "no"
   - `publicDomain`: must be "yes" or "no"
7. **URL Validation**:
   - `ebookCover` must be a valid HTTP or HTTPS URL
   - `ebookContent` must be a valid HTTP or HTTPS URL
8. **Prerequisites**:
   - Vendor must have completed Vendor Information
   - Vendor must have completed Bank Information

## Success Response

**Status Code**: `201 Created`

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

## Error Responses

### Missing Required Fields
**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "message": "All required fields must be provided"
}
```

### Legal Authorization Not Accepted
**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "message": "You must accept legal authorization to publish an eBook"
}
```

### Invalid ISBN Format
**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "message": "Invalid ISBN format. Please provide a valid ISBN-10 or ISBN-13"
}
```

### Invalid Price
**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "message": "Sale price must be a positive number"
}
```

### Missing Borrow Information
**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "message": "borrowFee and borrowPeriod are required when makeAvailableForBorrow is true"
}
```

### Vendor Information Not Complete
**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "message": "Please complete your Vendor Information before publishing an eBook"
}
```

### Bank Information Not Complete
**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "message": "Please complete your Bank Information before publishing an eBook"
}
```

### Invalid eBook Cover URL
**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "message": "ebookCover must be a valid HTTP/HTTPS URL"
}
```

### Invalid eBook Content URL
**Status Code**: `400 Bad Request`

```json
{
  "success": false,
  "message": "ebookContent must be a valid HTTP/HTTPS URL"
}
```

### Internal Server Error
**Status Code**: `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Internal server error: <error details>"
}
```

## eBook ID Format

The system generates a unique eBook ID in the format:
```
ENG + 12 random numbers
```

Example: `ENG123456789012`

## eBook Status Values

After publication, the eBook will have one of the following statuses:
- `Pending Review` (initial status)
- `In Review`
- `Ready For Sale`
- `Not Approved`
- `Updated`
- `Suspended`
- `Unpublished`

## Example cURL Request

```bash
curl -X POST http://localhost:5001/api/store/vendor/publishEbook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "academicDiscipline": "Computer Science",
    "ebookTitle": "Introduction to JavaScript",
    "author": "John Doe",
    "publisher": "Tech Books Publishing",
    "publishedDate": "2026-01-15",
    "edition": "2nd Edition",
    "series": "Web Development Series",
    "isbn": "978-3-16-148410-0",
    "language": "English",
    "synopsis": "A comprehensive guide to JavaScript programming.",
    "aboutAuthor": "John Doe is a software engineer with 10 years of experience.",
    "academicRecommendation": "yes",
    "publicDomain": "no",
    "ebookCover": "https://s3.amazonaws.com/your-bucket/covers/js-cover.jpg",
    "ebookContent": "https://s3.amazonaws.com/your-bucket/ebooks/js-book.pdf",
    "salePrice": 8000,
    "makeAvailableForBorrow": true,
    "borrowFee": 500,
    "borrowPeriod": 14,
    "legalAuthorization": true
  }'
```

## Notes

1. **Vendor ID Extraction**: The vendor ID is automatically extracted from the JWT token
2. **Price Formatting**: The API accepts prices with commas (e.g., "8,000") and converts them to numbers
3. **Date Format**: `dateListed` is automatically set to the current date
4. **URL Validation**: Both `ebookCover` and `ebookContent` must be valid HTTP/HTTPS URLs
5. **File Storage**: Upload your cover and eBook files to S3 or another storage service first, then use those URLs
6. **Security**: All requests must include a valid JWT token for authentication

## Database Schema

The eBook is stored in the `VendorEbook` collection with the following structure:

```javascript
{
  vendorId: String,
  ebookId: String (unique),
  academicDiscipline: String,
  ebookTitle: String,
  author: String,
  publisher: String,
  publishedDate: String,
  edition: String,
  series: String,
  isbn: String,
  language: String,
  synopsis: String,
  aboutAuthor: String,
  academicRecommendation: String ("yes" | "no"),
  publicDomain: String ("yes" | "no"),
  ebookCover: String,
  ebookContent: String,
  salePrice: Number,
  makeAvailableForBorrow: Boolean,
  borrowFee: Number,
  borrowPeriod: Number,
  legalAuthorization: Boolean,
  status: String,
  dateListed: Date,
  createdAt: Date,
  updatedAt: Date
}
```
