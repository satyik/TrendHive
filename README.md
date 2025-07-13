# TrendHive API

A modern, RESTful API for the TrendHive Social Commerce Platform, refactored for React frontend integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Registration, login, profile management, and user search
- **Social Features**: Groups, posts, comments, and likes
- **E-commerce**: Product management, shopping cart, and wishlist functionality
- **File Upload**: Profile pictures and post images with Multer
- **Email Notifications**: Contact form and password reset emails
- **Rate Limiting**: API protection against abuse
- **CORS Support**: Configured for React frontend
- **Validation**: Input validation with Joi
- **Error Handling**: Comprehensive error handling and logging

## 📋 Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Usage Examples](#usage-examples)
- [Development](#development)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TrendHive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URL=mongodb://localhost:27017/trendhive

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-password
ADMIN_EMAIL=admin@trendhive.com

# File Upload (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### User Management

#### Search Users
```http
GET /api/users/search?q=john&page=1&limit=10
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phoneNumber": "9876543210"
}
```

### Groups

#### Create Group
```http
POST /api/groups
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Tech Enthusiasts",
  "description": "A group for tech lovers",
  "category": "Technology",
  "photo": <file>
}
```

#### Join Group
```http
POST /api/groups/:id/join
Authorization: Bearer <token>
```

#### Get Group Feed
```http
GET /api/groups/:id/feed?page=1&limit=10
Authorization: Bearer <token>
```

### Posts

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "content": "Hello world!",
  "groupId": "group-id-optional",
  "photo": <file>
}
```

#### Like/Unlike Post
```http
POST /api/posts/:id/like
Authorization: Bearer <token>
```

#### Add Comment
```http
POST /api/posts/:id/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great post!"
}
```

### Products & Shopping

#### Get Products
```http
GET /api/products?page=1&limit=10&category=electronics&search=laptop
```

#### Add to Cart
```http
POST /api/products/cart/:id
Authorization: Bearer <token>
```

#### Get Cart
```http
GET /api/products/cart
Authorization: Bearer <token>
```

#### Add to Wishlist
```http
POST /api/products/wishlist/:id
Authorization: Bearer <token>
```

### Contact Form

#### Submit Contact
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "Hello, I have a question..."
}
```

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── nodemailer.js
│   └── variables.js
├── controllers/      # Route controllers
│   ├── authController.js
│   ├── contactController.js
│   ├── groupController.js
│   ├── postController.js
│   ├── productController.js
│   └── userController.js
├── middleware/       # Custom middleware
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
├── models/          # Database models
│   ├── Contact.js
│   ├── Group.js
│   ├── Post.js
│   ├── product.model.js
│   └── User.js
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── contactRoutes.js
│   ├── groupRoutes.js
│   ├── postRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
├── utils/           # Utility functions
│   └── Utilities.js
├── validators/      # Input validation
│   └── authValidators.js
└── server.js        # Main server file
```

## 💡 Usage Examples

### React Frontend Integration

```javascript
// Authentication
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
  }
  return data;
};

// Protected API calls
const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  });
  
  return response.json();
};

// File upload
const uploadPhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:5000/api/users/upload-photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: formData,
  });
  
  return response.json();
};
```

### Error Handling

All API responses follow a consistent format:

```javascript
// Success response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}

// Error response
{
  "success": false,
  "error": "Error message"
}
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### API Response Format

All API endpoints return JSON responses with the following structure:

```javascript
{
  "success": boolean,
  "message": "string (optional)",
  "data": {
    // Response data
  },
  "error": "string (for errors)"
}
```

### Pagination

List endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Response includes pagination metadata:
```javascript
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Authentication

The API supports two authentication methods:
1. **JWT Cookies**: Automatically set on login/register
2. **Authorization Header**: `Bearer <token>`

### File Upload

File uploads are handled with Multer and support:
- Profile pictures
- Post images
- Group photos

### Rate Limiting

API endpoints are protected with rate limiting:
- 100 requests per 15 minutes per IP
- Custom limits for specific endpoints

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Joi schema validation
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers
- **Environment Variables**: Secure configuration management

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.
