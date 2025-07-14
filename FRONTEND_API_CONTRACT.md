# TrendHive API Contract for Frontend Team

This document defines the API contracts between the backend and frontend teams for the TrendHive platform. It includes endpoint specifications, request/response formats, authentication, and error handling standards.

---

## 1. Authentication

### Register
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "phoneNumber": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": { "id": "string", "name": "string", "email": "string", "profilePic": "string|null" },
      "token": "string"
    }
  }
  ```

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { "id": "string", "name": "string", "email": "string", "profilePic": "string|null" },
      "token": "string"
    }
  }
  ```

### Logout
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  { "success": true, "message": "Logged out successfully" }
  ```

### Get Profile
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "phoneNumber": "string",
        "profilePic": "string|null",
        "username": "string|null",
        "color": ["string"],
        "favCeleb": ["string"],
        "activeR": true
      }
    }
  }
  ```

---

## 2. Users

### Search Users
- **GET** `/api/users/search?q=<query>&page=1&limit=10`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "users": [
        { "id": "string", "name": "string", "email": "string", "username": "string", "profilePic": "string|null" }
      ],
      "pagination": { "currentPage": 1, "totalPages": 1, "totalUsers": 1, "hasNextPage": false, "hasPrevPage": false }
    }
  }
  ```

### Update Profile
- **PUT** `/api/users/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  { "name": "string", "phoneNumber": "string", "username": "string" }
  ```
- **Response:**
  ```json
  { "success": true, "message": "User updated successfully", "data": { "user": { ... } } }
  ```

### Upload Profile Photo
- **POST** `/api/users/upload-photo`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `multipart/form-data` with `photo` field
- **Response:**
  ```json
  { "success": true, "message": "Profile photo uploaded successfully", "data": { "user": { ... } } }
  ```

---

## 3. Groups

### Create Group
- **POST** `/api/groups`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `multipart/form-data` with fields: `name`, `description`, `category`, `photo`
- **Response:**
  ```json
  { "success": true, "message": "Group created successfully", "data": { "group": { ... } } }
  ```

### Join Group
- **POST** `/api/groups/:id/join`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  { "success": true, "message": "Successfully joined the group" }
  ```

### Get Group Feed
- **GET** `/api/groups/:id/feed?page=1&limit=10`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "posts": [ { ... } ],
      "pagination": { "currentPage": 1, "totalPages": 1, "totalPosts": 1, "hasNextPage": false, "hasPrevPage": false }
    }
  }
  ```

---

## 4. Posts

### Create Post
- **POST** `/api/posts`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `multipart/form-data` with fields: `content`, `groupId`, `photo`
- **Response:**
  ```json
  { "success": true, "message": "Post created successfully", "data": { "post": { ... } } }
  ```

### Like/Unlike Post
- **POST** `/api/posts/:id/like`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  { "success": true, "message": "Post liked", "data": { "post": { ... } } }
  ```

### Add Comment
- **POST** `/api/posts/:id/comment`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  { "content": "string" }
  ```
- **Response:**
  ```json
  { "success": true, "message": "Comment added successfully", "data": { "post": { ... } } }
  ```

---

## 5. Products & Shopping

### Get Products
- **GET** `/api/products?page=1&limit=10&category=<cat>&search=<query>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "products": [ { ... } ],
      "pagination": { "currentPage": 1, "totalPages": 1, "totalProducts": 1, "hasNextPage": false, "hasPrevPage": false }
    }
  }
  ```

### Add to Cart
- **POST** `/api/products/cart/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  { "success": true, "message": "Product added to cart successfully", "data": { "bagItems": [ ... ] } }
  ```

### Get Cart
- **GET** `/api/products/cart`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "items": [ { ... } ],
      "total": 0,
      "quantity": 0,
      "discount": 0
    }
  }
  ```

---

## 6. Contact

### Submit Contact Form
- **POST** `/api/contact`
- **Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "subject": "string",
    "message": "string"
  }
  ```
- **Response:**
  ```json
  { "success": true, "message": "Your message has been submitted successfully.", "data": { "contact": { ... } } }
  ```

---

## 7. Error Handling

- All error responses follow this format:
  ```json
  { "success": false, "error": "Error message" }
  ```
- HTTP status codes are used appropriately (400, 401, 403, 404, 500, etc).

---

## 8. Authentication

- Use JWT tokens for all protected endpoints.
- Tokens can be sent via `Authorization: Bearer <token>` header or as a `jwt` cookie.
- On login/register, the backend will set a `jwt` cookie and return the token in the response.

---

## 9. File Uploads

- Use `multipart/form-data` for uploading images (profile, post, group).
- The field name for images is always `photo`.

---

## 10. Pagination

- List endpoints support `page` and `limit` query parameters.
- Pagination info is always included in the response.

---

**If you need more details or examples for any endpoint, let the backend team know!** 