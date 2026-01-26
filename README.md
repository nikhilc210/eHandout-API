# eHandout API

API backend for eHandout Books platform - A marketplace for eBooks with vendor management, LMS integration, and file handling.

## 🚀 Features

- **Store Management**
  - Vendor Registration & Authentication
  - Vendor Information Management
  - Bank Information Management
  - eBook Cover Management
  - **eBook Publishing** ✨ NEW
  
- **LMS Integration**
  - Student and Lecturer Account Management
  - Academic Management System

- **File Management**
  - File Upload System (AWS S3)
  - Document Management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- AWS Account (for S3 storage)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/nikhilc210/eHandout-API.git
cd eHandout-API
```

2. Install dependencies:
```bash
cd server
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ehandout

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name
```

5. Start the server:
```bash
npm start
```

The API will be running at `http://localhost:5001`

## 📚 API Endpoints

### Authentication & Vendor Management

#### Vendor Registration
```
POST /api/store/vendor/register
```

#### Verify OTP
```
POST /api/store/vendor/verifyOtp
```

#### Resend OTP
```
POST /api/store/vendor/resendOtp
```

#### Vendor Authentication
```
POST /api/store/vendor/auth
```

### Vendor Information

#### Update Vendor Information
```
POST /api/store/vendor/vendorInformation
Authorization: Bearer <token>
```

#### Get Vendor Information
```
GET /api/store/vendor/vendorInformation
Authorization: Bearer <token>
```

#### Update Bank Information
```
POST /api/store/vendor/vendorBankInformation
Authorization: Bearer <token>
```

#### Get Bank Information
```
GET /api/store/vendor/vendorBankInformation
Authorization: Bearer <token>
```

### eBook Cover Management

#### Create eBook Cover
```
POST /api/store/vendor/vendoreBookCover
Authorization: Bearer <token>
```

#### Update eBook Cover
```
PUT /api/store/vendor/vendoreBookCover
Authorization: Bearer <token>
```

#### Get All eBook Covers
```
GET /api/store/vendor/vendoreBookCover
Authorization: Bearer <token>
```

#### Get Specific eBook Cover
```
GET /api/store/vendor/vendoreBookCover/:coverId
Authorization: Bearer <token>
```

### 📖 eBook Publishing (NEW)

#### Publish eBook
```
POST /api/store/vendor/publishEbook
Authorization: Bearer <token>
```

**Request Body:**
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
  "synopsis": "A comprehensive guide to JavaScript...",
  "aboutAuthor": "John Doe is a software engineer...",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "65f25ab52b4c29cf69ee2401bbe",
  "ebookContent": "65f25ab52b4c29cf69ee2401bbf",
  "salePrice": 8000,
  "makeAvailableForBorrow": true,
  "borrowFee": 500,
  "borrowPeriod": 14,
  "legalAuthorization": true
}
```

**Success Response:**
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

For complete documentation, see [PUBLISH_EBOOK_API.md](./PUBLISH_EBOOK_API.md)

### File Upload
```
POST /api/file/upload
Authorization: Bearer <token>
```

### LMS Routes
```
/api/lms/*
```

### Manager Routes
```
/api/manager/*
```

## 🗂️ Project Structure

```
eHandout-API/
├── server/
│   ├── config/
│   │   ├── db.js              # Database configuration
│   │   └── s3.js              # AWS S3 configuration
│   ├── controllers/
│   │   ├── Files/             # File upload controllers
│   │   ├── Manager/           # Manager controllers
│   │   └── Store/
│   │       └── Vendor/        # Vendor controllers
│   ├── middleware/
│   │   └── Tokens/            # JWT authentication middleware
│   ├── models/
│   │   ├── DeviceAssignment/  # Device models
│   │   ├── DeviceModel/
│   │   ├── LMS/              # LMS models
│   │   ├── Manager/          # Manager models
│   │   └── Store/
│   │       └── Vendor/       # Vendor models (including VendorEbook)
│   ├── routes/
│   │   ├── Files/            # File routes
│   │   ├── LMS/              # LMS routes
│   │   ├── Manager/          # Manager routes
│   │   └── Vendor/           # Vendor routes
│   ├── utils/                # Utility functions
│   ├── index.js              # Server entry point
│   └── package.json
├── .gitignore
├── PUBLISH_EBOOK_API.md       # Detailed eBook API documentation
├── IMPLEMENTATION_SUMMARY.md  # Implementation details
├── postman_collection_publish_ebook.json  # Postman test collection
└── README.md
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **@aws-sdk/client-s3** - AWS S3 integration
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **express-validator** - Input validation
- **libphonenumber-js** - Phone number validation
- **dotenv** - Environment variables

## 🧪 Testing

Import the Postman collection for testing:
- `postman_collection_publish_ebook.json` - eBook publishing tests

## 📄 Documentation

- [Publish eBook API Documentation](./PUBLISH_EBOOK_API.md) - Complete guide for the eBook publishing endpoint
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Technical implementation details

## 🛡️ Security

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Helmet for security headers
- CORS configuration
- Environment variables for sensitive data

## 🌱 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | No (default: 5001) |
| NODE_ENV | Environment (development/production) | No |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT | Yes |
| JWT_EXPIRES_IN | JWT expiration time | No (default: 7d) |
| AWS_REGION | AWS region | Yes |
| AWS_ACCESS_KEY_ID | AWS access key | Yes |
| AWS_SECRET_ACCESS_KEY | AWS secret key | Yes |
| AWS_BUCKET_NAME | S3 bucket name | Yes |

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 📝 License

ISC

## 👥 Author

**Nikhil Chandeshwar**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email nikhilchandeshwar@example.com or open an issue in the repository.

---

Made with ❤️ for eHandout Books
