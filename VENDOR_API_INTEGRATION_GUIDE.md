# eHandout Vendor API Integration Guide

**Base URL:** `http://localhost:5001/api/store/vendor`  
**Authentication:** JWT Bearer Token (obtained after login)

---

## Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Vendor Profile Management](#vendor-profile-management)
3. [eBook Management](#ebook-management)
4. [Security Settings](#security-settings)
5. [Testimonials](#testimonials)
6. [Error Handling](#error-handling)
7. [Code Examples](#code-examples)

---

## Authentication Flow

### 1. Register Vendor
**POST** `/register`

```javascript
// Request
{
  "country": "Nigeria",
  "email": "vendor@example.com",
  "phoneCode": "+234",
  "mobile": "8012345678",
  "password": "SecurePass123"
}

// Response (201)
{
  "success": true,
  "message": "Vendor registered successfully. OTP generated",
  "otp": 123456
}
```

### 2. Verify OTP
**POST** `/verifyOtp`

```javascript
// Request
{
  "email": "vendor@example.com",
  "otp": "123456"
}

// Response (200)
{
  "success": true,
  "message": "Thank you for signing up with eHandout Books as a vendor",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Store this token for all authenticated requests
localStorage.setItem('vendorToken', response.token);
```

### 3. Resend OTP
**POST** `/resendOtp`

```javascript
// Request
{
  "email": "vendor@example.com"
}

// Response (200)
{
  "success": true,
  "message": "OTP resent",
  "otp": 654321
}
```

### 4. Login (Auth)
**POST** `/auth`

```javascript
// Request
{
  "email": "vendor@example.com",
  "password": "SecurePass123"
}

// Response (200)
{
  "success": true,
  "message": "OTP generated successfully (for testing only)",
  "otp": 789012,
  "email": "vendor@example.com"
}

// Then verify OTP using /verifyOtp to get token
```

---

## Vendor Profile Management

### 1. Update Vendor Information
**POST** `/vendorInformation`  
**Auth Required:** ✅

```javascript
// Headers
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}

// Request
{
  "accountType": "Individual", // or "Company"
  "vendorType": "Publisher", // or "Author"
  "vendorName": "John Doe Publishing",
  "tin": "12345678", // Optional
  "address": "123 Main Street",
  "city": "Lagos",
  "state": "Lagos State",
  "country": "Nigeria",
  "identityType": "Driver License", // or "International Passport", etc.
  "dateOfIssue": "2020-01-15",
  "expiryDate": "2025-01-15",
  "identityFile": "https://example.com/id.pdf"
}

// Response (200)
{
  "success": true,
  "message": "Your information has been submitted successfully"
}
```

### 2. Get Vendor Information
**GET** `/vendorInformation`  
**Auth Required:** ✅

```javascript
// Response (200)
{
  "success": true,
  "message": "Vendor Information retrieved successfully",
  "vendor": {
    "vendorId": "V1234567890",
    "accountType": "Individual",
    "vendorType": "Publisher",
    // ... all vendor information
  }
}
```

### 3. Update Bank Information
**POST** `/vendorBankInformation`  
**Auth Required:** ✅

```javascript
// Request
{
  "bankCountry": "Nigeria",
  "bankBranchState": "Lagos State",
  "bankCurrency": "NGN",
  "bankName": "First Bank",
  "bankBranchName": "Ikeja Branch",
  "bankBranchCode": "011152052",
  "swiftBicCode": "FBNINGLA",
  "accountNumber": "1234567890",
  "accountHolderName": "John Doe",
  "accountType": "Savings", // Optional
  "routingNumber": "123456789", // Optional
  "sortCode": "12-34-56" // Optional
}

// Response (200)
{
  "success": true,
  "message": "Your bank account information has been submitted successfully"
}
```

### 4. Get Bank Information
**GET** `/vendorBankInformation`  
**Auth Required:** ✅

```javascript
// Response (200)
{
  "success": true,
  "message": "Vendor bank information retrieved successfully",
  "bank": {
    "vendorId": "V1234567890",
    "bankName": "First Bank",
    // ... all bank information
  }
}
```

---

## eBook Management

### 1. Create eBook Cover
**POST** `/vendoreBookCover`  
**Auth Required:** ✅

```javascript
// Request
{
  "coverName": "Machine Learning Cover",
  "coverURL": "https://example.com/covers/ml-cover.jpg"
}

// Response (200)
{
  "success": true,
  "message": "eBook cover saved successfully"
}
```

### 2. Update eBook Cover
**PUT** `/vendoreBookCover`  
**Auth Required:** ✅

```javascript
// Request
{
  "coverId": "6978a41c3cac8f69b2414eeb",
  "coverName": "Updated Cover Name",
  "isLocked": true,
  "coverURL": "https://example.com/covers/updated.jpg"
}

// Response (200)
{
  "success": true,
  "message": "eBook cover updated successfully"
}
```

### 3. Get All eBook Covers
**GET** `/vendoreBookCover`  
**Auth Required:** ✅

```javascript
// Response (200)
{
  "success": true,
  "message": "Covers fetched successfully.",
  "data": [
    {
      "_id": "...",
      "vendorId": "V1234567890",
      "coverId": "ECT3IYW4",
      "coverName": "Science Cover",
      "coverURL": "https://...",
      "isLocked": true,
      "createdAt": "2026-01-27T10:00:00.000Z"
    }
  ]
}
```

### 4. Get Locked Book Covers (All Vendors)
**GET** `/lockedBookCovers`  
**Auth Required:** ✅

```javascript
// Response (200)
{
  "success": true,
  "message": "Locked book covers fetched successfully.",
  "count": 5,
  "data": [...]
}
```

### 5. Get Academic Disciplines
**GET** `/academicDisciplines`  
**Auth Required:** ✅

```javascript
// Response (200)
{
  "success": true,
  "message": "Active academic disciplines fetched successfully.",
  "count": 15,
  "data": [
    {
      "_id": "66f3b001a1b2c3d4e5000009",
      "disciplineId": "DISC001",
      "name": "Computer Science",
      "description": "...",
      "status": "Active"
    }
  ]
}
```

### 6. Publish eBook
**POST** `/publishEbook`  
**Auth Required:** ✅

```javascript
// Request
{
  "academicDiscipline": "66f3b001a1b2c3d4e5000009", // MongoDB ObjectId
  "ebookTitle": "Introduction to Machine Learning",
  "author": "Dr. Jane Smith",
  "publisher": "Tech Publishers Inc.",
  "publishedDate": "2024-01-15",
  "edition": "2nd Edition", // Optional
  "series": "AI Series", // Optional
  "isbn": "978-0-123456-78-9",
  "language": "English",
  "synopsis": "A comprehensive guide to machine learning...",
  "aboutAuthor": "Dr. Jane Smith is a professor...",
  "academicRecommendation": "yes", // or "no"
  "publicDomain": "no", // or "yes"
  "ebookCover": "https://example.com/covers/ml-intro.jpg",
  "ebookContent": "https://example.com/books/ml-intro.pdf",
  "salePrice": "8000", // Supports comma format: "8,000"
  "makeAvailableForBorrow": true,
  "borrowFee": "500",
  "borrowPeriod": 30, // in days
  "legalAuthorization": true
}

// Response (201)
{
  "success": true,
  "message": "Congratulations! Your eBook has been successfully published on eHandout Books.",
  "data": {
    "publishId": "PUB123456789012",
    "ebookId": "ENG987654321098",
    "status": "Active",
    "dateListed": "2026-01-27"
  }
}
```

**Validation Rules:**
- ✅ ISBN: Must be valid ISBN-10 or ISBN-13
- ✅ URLs: Must be valid HTTP/HTTPS
- ✅ Price: Positive number, accepts comma format
- ✅ Password must be at least 8 characters
- ✅ Vendor must complete profile and bank info first
- ✅ If borrowing enabled, borrowFee and borrowPeriod required

### 7. Get My Published eBooks
**GET** `/myPublishedEbooks`  
**Auth Required:** ✅

```javascript
// Response (200)
{
  "success": true,
  "message": "Published eBooks fetched successfully.",
  "count": 10,
  "data": [
    {
      "_id": "...",
      "publishId": "PUB123456789012",
      "ebookId": "ENG987654321098",
      "academicDiscipline": "66f3b001a1b2c3d4e5000009",
      "academicDisciplineName": "Computer Science", // Auto-populated
      "ebookTitle": "Introduction to ML",
      "author": "Dr. Jane Smith",
      "status": "Active",
      "salePrice": 8000,
      // ... all eBook fields
    }
  ]
}
```

### 8. Get eBook Details by ID
**GET** `/publishedEbook/:ebookId`  
**Auth Required:** ✅

```javascript
// Request URL
GET /publishedEbook/6978a41c3cac8f69b2414eeb

// Response (200)
{
  "success": true,
  "message": "eBook details fetched successfully.",
  "data": {
    "_id": "6978a41c3cac8f69b2414eeb",
    "publishId": "PUB123456789012",
    // ... complete eBook details with academicDisciplineName
  }
}

// Error (403) - Not owner
{
  "success": false,
  "message": "You don't have permission to view this eBook."
}
```

### 9. Update Published eBook
**PUT** `/publishedEbook/:ebookId`  
**Auth Required:** ✅

**Only 4 fields are editable:**

```javascript
// Request
{
  "status": "Active", // "Active", "Suspend", "Reinstate", "Republish"
  "aboutAuthor": "Updated author biography...",
  "academicRecommendation": "yes", // "yes" or "no"
  "publicDomain": "no" // "yes" or "no"
}

// Response (200)
{
  "success": true,
  "message": "eBook updated successfully.",
  "data": {
    // ... complete updated eBook details
  }
}
```

**Note:** All other fields (title, price, ISBN, etc.) cannot be modified after publishing.

### 10. Get Locked eBooks
**GET** `/lockedEbooks`  
**Auth Required:** ✅

```javascript
// Response (200)
{
  "success": true,
  "message": "Locked eBooks fetched successfully.",
  "count": 2,
  "data": [
    {
      "_id": "...",
      "vendorId": "G9005c7903a7d84f7ac28bf7",
      "bookId": "ECT3IYW4",
      "bookName": "CN78JSTFCHS",
      "bookURL": "https://www.pdfbooksworld.com/...",
      "isLocked": true
    }
  ]
}
```

---

## Security Settings

### 1. Change Password
**PUT** `/changePassword`  
**Auth Required:** ✅

```javascript
// Request
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmNewPassword": "NewPass456"
}

// Response (200)
{
  "success": true,
  "message": "Your password has been changed successfully"
}

// Error (400) - Password too short
{
  "success": false,
  "message": "Your Password must be at least 8 characters long."
}

// Error (401) - Wrong current password
{
  "success": false,
  "message": "Current password is incorrect."
}
```

### 2. Enable Two-Factor Authentication
**POST** `/toggleTwoFactor`  
**Auth Required:** ✅

**Step 1: Request verification code**
```javascript
// Request
{
  "enable": true
}

// Response (200)
{
  "success": true,
  "message": "A verification code has been sent to vendor@example.com. Please check your inbox, enter the code below, and then click 'Verify'",
  "code": 1234 // Remove in production
}
```

**Step 2: Verify code**
**POST** `/verifyTwoFactor`

```javascript
// Request
{
  "code": "1234"
}

// Response (200)
{
  "success": true,
  "message": "Two-Factor Authentication has been enabled successfully."
}

// Error (400) - Code expired
{
  "success": false,
  "message": "Verification code has expired. Please request a new code."
}

// Error (400) - Invalid code
{
  "success": false,
  "message": "Invalid verification code."
}
```

**Disable 2FA:**
```javascript
// Request
{
  "enable": false
}

// Response (200)
{
  "success": true,
  "message": "Two-Factor Authentication has been disabled."
}
```

### 3. Set Inactive Timeout
**PUT** `/inactiveTimeout`  
**Auth Required:** ✅

```javascript
// Request
{
  "timeoutMinutes": 30
}

// Response (200)
{
  "success": true,
  "message": "Your inactive timeout setting has been saved successfully",
  "data": {
    "timeoutMinutes": 30
  }
}

// Error (400) - Below minimum
{
  "success": false,
  "message": "Please set the default session inactive timeout to 30mins"
}
```

---

## Testimonials

### Submit Testimonial
**POST** `/testimonial`  
**Auth Required:** ✅

```javascript
// Request
{
  "rating": 5, // 1-5 (integer)
  "testimonial": "Great platform! Easy to use and manage.", // Max 300 chars
  "screenName": "JohnDoe123", // Max 25 chars
  "consentToQuote": true // Must be true
}

// Response (201)
{
  "success": true,
  "message": "Your rating and testimonial have been submitted successfully.",
  "data": {
    "id": "...",
    "rating": 5,
    "testimonial": "Great platform!...",
    "screenName": "JohnDoe123",
    "status": "Pending",
    "createdAt": "2026-01-27T14:30:00.000Z"
  }
}

// Error (403) - Suspended account
{
  "success": false,
  "message": "Your account is suspended. You cannot submit testimonials at this time."
}

// Error (400) - No consent
{
  "success": false,
  "message": "You must agree that your testimonial may be quoted on the eHandout platforms."
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized - No Token**
```javascript
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**403 Forbidden - Invalid Token**
```javascript
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**400 Bad Request - Validation Error**
```javascript
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field1": "Error message",
    "field2": "Error message"
  }
}
```

**404 Not Found**
```javascript
{
  "success": false,
  "message": "Resource not found."
}
```

**500 Internal Server Error**
```javascript
{
  "success": false,
  "message": "Internal server error: [error details]"
}
```

---

## Code Examples

### React/Axios Setup

```javascript
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5001/api/store/vendor',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vendorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('vendorToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage Examples

```javascript
// 1. Register vendor
const register = async (data) => {
  try {
    const response = await api.post('/register', data);
    console.log(response.data);
  } catch (error) {
    console.error(error.response?.data);
  }
};

// 2. Verify OTP and store token
const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post('/verifyOtp', { email, otp });
    localStorage.setItem('vendorToken', response.data.token);
    return response.data;
  } catch (error) {
    console.error(error.response?.data);
  }
};

// 3. Publish eBook
const publishEbook = async (ebookData) => {
  try {
    const response = await api.post('/publishEbook', ebookData);
    return response.data;
  } catch (error) {
    // Handle validation errors
    if (error.response?.status === 400) {
      const errors = error.response.data.errors || {};
      Object.keys(errors).forEach(field => {
        console.error(`${field}: ${errors[field]}`);
      });
    }
    throw error;
  }
};

// 4. Get my published eBooks
const getMyEbooks = async () => {
  try {
    const response = await api.get('/myPublishedEbooks');
    return response.data.data;
  } catch (error) {
    console.error(error.response?.data);
  }
};

// 5. Update eBook
const updateEbook = async (ebookId, updates) => {
  try {
    const response = await api.put(`/publishedEbook/${ebookId}`, updates);
    return response.data;
  } catch (error) {
    console.error(error.response?.data);
  }
};

// 6. Change password
const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
  try {
    const response = await api.put('/changePassword', {
      currentPassword,
      newPassword,
      confirmNewPassword
    });
    return response.data;
  } catch (error) {
    console.error(error.response?.data);
  }
};

// 7. Enable 2FA
const enable2FA = async () => {
  try {
    // Step 1: Request code
    const response = await api.post('/toggleTwoFactor', { enable: true });
    console.log(response.data.message);
    return response.data.code; // For testing
  } catch (error) {
    console.error(error.response?.data);
  }
};

// 8. Verify 2FA code
const verify2FA = async (code) => {
  try {
    const response = await api.post('/verifyTwoFactor', { code });
    return response.data;
  } catch (error) {
    console.error(error.response?.data);
  }
};

// 9. Set inactive timeout
const setInactiveTimeout = async (minutes) => {
  try {
    const response = await api.put('/inactiveTimeout', { 
      timeoutMinutes: minutes 
    });
    return response.data;
  } catch (error) {
    console.error(error.response?.data);
  }
};

// 10. Submit testimonial
const submitTestimonial = async (rating, testimonial, screenName) => {
  try {
    const response = await api.post('/testimonial', {
      rating,
      testimonial,
      screenName,
      consentToQuote: true
    });
    return response.data;
  } catch (error) {
    console.error(error.response?.data);
  }
};
```

### Form Validation Examples

```javascript
// Password validation
const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  return null;
};

// ISBN validation
const validateISBN = (isbn) => {
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
    return "ISBN must be 10 or 13 digits";
  }
  return null;
};

// URL validation
const validateURL = (url) => {
  const urlRegex = /^https?:\/\/.+/;
  if (!urlRegex.test(url)) {
    return "Must be a valid HTTP/HTTPS URL";
  }
  return null;
};

// Price formatting
const formatPrice = (price) => {
  // Remove commas and parse
  return parseFloat(price.replace(/,/g, ''));
};
```

---

## Testing Checklist

### Authentication
- [ ] Register new vendor
- [ ] Verify OTP
- [ ] Resend OTP
- [ ] Login with credentials
- [ ] Handle expired token

### Profile
- [ ] Update vendor information
- [ ] Update bank information
- [ ] Fetch vendor details
- [ ] Fetch bank details

### eBooks
- [ ] Create eBook cover
- [ ] Lock/unlock cover
- [ ] Fetch academic disciplines
- [ ] Publish eBook
- [ ] Fetch my eBooks
- [ ] View eBook details
- [ ] Update eBook (editable fields only)

### Security
- [ ] Change password
- [ ] Enable 2FA
- [ ] Verify 2FA code
- [ ] Disable 2FA
- [ ] Set inactive timeout

### Testimonials
- [ ] Submit testimonial
- [ ] Handle character limits
- [ ] Handle suspended account

---

## Important Notes

1. **Token Management:**
   - Store JWT token securely (localStorage/sessionStorage)
   - Add token to all authenticated requests
   - Handle token expiration gracefully

2. **Error Handling:**
   - Always check `success` field in response
   - Display user-friendly error messages
   - Log errors for debugging

3. **Validation:**
   - Validate on frontend before API call
   - Handle backend validation errors
   - Show field-specific errors to users

4. **Price Formatting:**
   - API accepts comma-separated prices: "8,000"
   - Automatically parsed on backend

5. **Date Formatting:**
   - Use YYYY-MM-DD format for dates
   - API returns ISO 8601 format

6. **File Uploads:**
   - Upload files to storage first (AWS S3)
   - Send URLs to API, not files

7. **2FA Flow:**
   - Must verify code within 10 minutes
   - Code is 4 digits
   - Enable → Request Code → Verify Code

8. **Session Timeout:**
   - Minimum 30 minutes recommended
   - Implement auto-logout on frontend

---

## Support

For issues or questions, contact the backend team or check the API logs for detailed error information.

**Last Updated:** January 27, 2026
