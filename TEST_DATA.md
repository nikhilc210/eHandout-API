# Dummy JSON Test Data for Publish eBook API

## ⚠️ Important Note About eBook Cover and Content

The `ebookCover` and `ebookContent` fields expect **HTTP/HTTPS URLs**, not MongoDB IDs.

**Examples:**
- `ebookCover`: `"https://s3.amazonaws.com/your-bucket/covers/javascript-cover.jpg"`
- `ebookContent`: `"https://s3.amazonaws.com/your-bucket/ebooks/javascript-ebook.pdf"`

These should be the S3 URLs or any other publicly accessible URLs where your cover image and eBook file are stored.

---

## Test Case 1: Complete Request (With Borrow Option)

```json
{
  "academicDiscipline": "Computer Science",
  "ebookTitle": "Introduction to JavaScript Programming",
  "author": "John Doe",
  "publisher": "Tech Books Publishing House",
  "publishedDate": "2026-01-15",
  "edition": "2nd Edition",
  "series": "Web Development Series",
  "isbn": "978-3-16-148410-0",
  "language": "English",
  "synopsis": "A comprehensive guide to JavaScript programming for beginners and intermediate developers. This book covers ES6+ features, async programming, and modern web development practices.",
  "aboutAuthor": "John Doe is a senior software engineer with over 10 years of experience in web development. He has worked with major tech companies and contributed to open-source projects.",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "https://s3.amazonaws.com/ehandout-books/covers/javascript-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/ehandout-books/ebooks/javascript-intro.pdf",
  "salePrice": 8000,
  "makeAvailableForBorrow": true,
  "borrowFee": 500,
  "borrowPeriod": 14,
  "legalAuthorization": true
}
```

## Test Case 2: Sale Only (No Borrow Option)

```json
{
  "academicDiscipline": "Mathematics",
  "ebookTitle": "Advanced Calculus and Analysis",
  "author": "Dr. Jane Smith",
  "publisher": "Academic Press International",
  "publishedDate": "2025-12-01",
  "edition": "1st Edition",
  "isbn": "978-0-123456-78-9",
  "language": "English",
  "synopsis": "An advanced textbook on calculus covering limits, derivatives, integrals, infinite series, and multivariable calculus. Perfect for undergraduate and graduate students.",
  "aboutAuthor": "Dr. Jane Smith is a professor of mathematics with 20 years of teaching experience at prestigious universities. She has published numerous research papers in mathematical analysis.",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "https://s3.amazonaws.com/ehandout-books/covers/calculus-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/ehandout-books/ebooks/advanced-calculus.pdf",
  "salePrice": 12000,
  "makeAvailableForBorrow": false,
  "legalAuthorization": true
}
```

## Test Case 3: With Comma-Formatted Prices

```json
{
  "academicDiscipline": "Physics",
  "ebookTitle": "Quantum Mechanics Fundamentals",
  "author": "Dr. Robert Johnson",
  "publisher": "Science Publishers Ltd",
  "publishedDate": "2026-01-01",
  "isbn": "978-1-234567-89-0",
  "language": "English",
  "synopsis": "An introduction to quantum mechanics covering wave functions, Schrödinger equation, operators, quantum harmonic oscillator, and perturbation theory.",
  "aboutAuthor": "Dr. Robert Johnson is a theoretical physicist specializing in quantum mechanics with numerous publications in leading physics journals.",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "https://s3.amazonaws.com/ehandout-books/covers/quantum-mechanics-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/ehandout-books/ebooks/quantum-mechanics.pdf",
  "salePrice": "15,000",
  "makeAvailableForBorrow": true,
  "borrowFee": "1,000",
  "borrowPeriod": 30,
  "legalAuthorization": true
}
```

## Test Case 4: ISBN-10 Format & Public Domain

```json
{
  "academicDiscipline": "Literature",
  "ebookTitle": "Classic Poetry Collection",
  "author": "Various Authors",
  "publisher": "Literary Heritage Press",
  "publishedDate": "2025-11-15",
  "isbn": "0-123456-78-9",
  "language": "English",
  "synopsis": "A collection of classic poetry from renowned authors including William Shakespeare, Emily Dickinson, Robert Frost, and Maya Angelou. Each poem is annotated with historical context.",
  "aboutAuthor": "This anthology features works from multiple acclaimed poets spanning different eras and literary movements. Compiled by literary scholars.",
  "academicRecommendation": "yes",
  "publicDomain": "yes",
  "ebookCover": "https://s3.amazonaws.com/ehandout-books/covers/poetry-collection-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/ehandout-books/ebooks/classic-poetry.pdf",
  "salePrice": 3000,
  "legalAuthorization": true
}
```

## Test Case 5: With Optional Series Field

```json
{
  "academicDiscipline": "Biology",
  "ebookTitle": "Cell Biology and Molecular Genetics",
  "author": "Dr. Sarah Williams",
  "publisher": "BioScience Publications",
  "publishedDate": "2025-10-20",
  "edition": "3rd Edition",
  "series": "Modern Biology Textbook Series",
  "isbn": "978-0-987654-32-1",
  "language": "English",
  "synopsis": "Comprehensive coverage of cell structure, function, molecular genetics, DNA replication, protein synthesis, and gene regulation. Includes latest research findings.",
  "aboutAuthor": "Dr. Sarah Williams is a molecular biologist and professor with extensive research experience in genetics and cell biology.",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "https://s3.amazonaws.com/ehandout-books/covers/cell-biology-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/ehandout-books/ebooks/cell-biology.pdf",
  "salePrice": 9500,
  "makeAvailableForBorrow": true,
  "borrowFee": 750,
  "borrowPeriod": 21,
  "legalAuthorization": true
}
```

## Test Case 6: Chemistry - No Academic Recommendation

```json
{
  "academicDiscipline": "Chemistry",
  "ebookTitle": "Organic Chemistry Reactions and Mechanisms",
  "author": "Prof. Michael Chen",
  "publisher": "Chemical Education Publishers",
  "publishedDate": "2025-09-10",
  "edition": "2nd Edition",
  "isbn": "978-1-111222-33-4",
  "language": "English",
  "synopsis": "Detailed exploration of organic chemistry reactions, mechanisms, stereochemistry, and synthesis strategies. Perfect for advanced undergraduate students.",
  "aboutAuthor": "Prof. Michael Chen has been teaching organic chemistry for 15 years and has won several teaching excellence awards.",
  "academicRecommendation": "no",
  "publicDomain": "no",
  "ebookCover": "https://s3.amazonaws.com/ehandout-books/covers/organic-chemistry-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/ehandout-books/ebooks/organic-chemistry.pdf",
  "salePrice": 10000,
  "makeAvailableForBorrow": true,
  "borrowFee": 800,
  "borrowPeriod": 20,
  "legalAuthorization": true
}
```

## Test Case 7: Economics - Long Borrow Period

```json
{
  "academicDiscipline": "Economics",
  "ebookTitle": "Microeconomics: Theory and Applications",
  "author": "Dr. David Brown",
  "publisher": "Economic Theory Press",
  "publishedDate": "2026-01-05",
  "isbn": "978-2-345678-90-1",
  "language": "English",
  "synopsis": "Comprehensive microeconomics textbook covering consumer theory, producer theory, market structures, game theory, and welfare economics.",
  "aboutAuthor": "Dr. David Brown is an economist and professor specializing in microeconomic theory and behavioral economics.",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "https://s3.amazonaws.com/ehandout-books/covers/microeconomics-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/ehandout-books/ebooks/microeconomics.pdf",
  "salePrice": 11000,
  "makeAvailableForBorrow": true,
  "borrowFee": 600,
  "borrowPeriod": 45,
  "legalAuthorization": true
}
```

## Test Case 8: History - Minimal Price

```json
{
  "academicDiscipline": "History",
  "ebookTitle": "World History: Ancient Civilizations",
  "author": "Prof. Emma Thompson",
  "publisher": "Historical Studies Publishing",
  "publishedDate": "2025-08-20",
  "isbn": "978-3-456789-01-2",
  "language": "English",
  "synopsis": "Exploration of ancient civilizations including Mesopotamia, Egypt, Greece, Rome, China, and the Americas. Rich with archaeological evidence and historical analysis.",
  "aboutAuthor": "Prof. Emma Thompson is a historian specializing in ancient civilizations with multiple published works and archaeological fieldwork experience.",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "https://s3.amazonaws.com/ehandout-books/covers/ancient-civilizations-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/ehandout-books/ebooks/ancient-civilizations.pdf",
  "salePrice": 5000,
  "makeAvailableForBorrow": false,
  "legalAuthorization": true
}
```

## Test Case 9: Philosophy - All Optional Fields Included

```json
{
  "academicDiscipline": "Philosophy",
  "ebookTitle": "Introduction to Western Philosophy",
  "author": "Dr. James Anderson",
  "publisher": "Philosophy Press International",
  "publishedDate": "2025-07-15",
  "edition": "4th Edition",
  "series": "Introduction to Philosophy Series",
  "isbn": "978-4-567890-12-3",
  "language": "English",
  "synopsis": "Comprehensive introduction to Western philosophical thought from ancient Greece to contemporary philosophy. Covers metaphysics, epistemology, ethics, and political philosophy.",
  "aboutAuthor": "Dr. James Anderson is a philosophy professor with expertise in ancient Greek philosophy and contemporary ethics. He has authored several books on philosophical topics.",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "https://s3.amazonaws.com/ehandout-books/covers/western-philosophy-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/ehandout-books/ebooks/western-philosophy.pdf",
  "salePrice": 7500,
  "makeAvailableForBorrow": true,
  "borrowFee": 400,
  "borrowPeriod": 28,
  "legalAuthorization": true
}
```

## Test Case 10: Engineering - High Price Point

```json
{
  "academicDiscipline": "Engineering",
  "ebookTitle": "Advanced Structural Engineering Design",
  "author": "Eng. Peter Morrison",
  "publisher": "Engineering Technical Publishers",
  "publishedDate": "2026-01-10",
  "edition": "1st Edition",
  "isbn": "978-5-678901-23-4",
  "language": "English",
  "synopsis": "Advanced structural engineering covering steel and concrete design, seismic analysis, foundation design, and structural dynamics. Includes real-world case studies.",
  "aboutAuthor": "Eng. Peter Morrison is a licensed structural engineer with 25 years of experience designing major infrastructure projects worldwide.",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "https://s3.amazonaws.com/ehandout-books/covers/structural-engineering-cover.jpg",
  "ebookContent": "https://s3.amazonaws.com/ehandout-books/ebooks/structural-engineering.pdf",
  "salePrice": 18000,
  "makeAvailableForBorrow": true,
  "borrowFee": 1500,
  "borrowPeriod": 30,
  "legalAuthorization": true
}
```

---

## 🔧 How to Use These Test Cases

### 1. Replace URLs
Before testing, replace the example URLs with your actual S3 or file storage URLs:
- `ebookCover`: Your cover image URL (e.g., `"https://s3.amazonaws.com/your-bucket/covers/mybook-cover.jpg"`)
- `ebookContent`: Your eBook file URL (e.g., `"https://s3.amazonaws.com/your-bucket/ebooks/mybook.pdf"`)

**Both fields must be valid HTTP or HTTPS URLs.**

### 2. Example with Your Own URLs
```json
{
  "academicDiscipline": "Computer Science",
  "ebookTitle": "Introduction to JavaScript Programming",
  "author": "John Doe",
  "publisher": "Tech Books Publishing House",
  "publishedDate": "2026-01-15",
  "isbn": "978-3-16-148410-0",
  "language": "English",
  "synopsis": "A comprehensive guide to JavaScript programming...",
  "aboutAuthor": "John Doe is a senior software engineer...",
  "academicRecommendation": "yes",
  "publicDomain": "no",
  "ebookCover": "https://your-actual-s3-bucket.amazonaws.com/covers/js-cover.jpg",
  "ebookContent": "https://your-actual-s3-bucket.amazonaws.com/ebooks/js-book.pdf",
  "salePrice": 8000,
  "makeAvailableForBorrow": true,
  "borrowFee": 500,
  "borrowPeriod": 14,
  "legalAuthorization": true
}
```

### 3. Test Using cURL
```bash
curl -X POST http://localhost:5001/api/store/vendor/publishEbook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d 'PASTE_JSON_HERE'
```

### 4. Test Using Postman
1. Create new POST request
2. URL: `http://localhost:5001/api/store/vendor/publishEbook`
3. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_JWT_TOKEN`
4. Body: Select "raw" and "JSON", paste the test data

---

## ✅ Expected Success Response

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

## 📋 ISBN Formats You Can Use

### Valid ISBN-13 Examples:
- `978-3-16-148410-0`
- `978-0-123456-78-9`
- `978-1-234567-89-0`
- `9783161484100` (without hyphens)

### Valid ISBN-10 Examples:
- `0-123456-78-9`
- `0123456789`
- `012345678X` (X is valid as check digit)

---

**Note**: Make sure you have:
1. Valid JWT token
2. Completed Vendor Information
3. Completed Bank Information
4. Valid HTTP/HTTPS URLs for cover and content files
