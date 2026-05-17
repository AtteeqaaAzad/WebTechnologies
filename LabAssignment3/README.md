# Lab Assignment 4 — RESTful API with JWT

Builds on Lab Assignment 3 by adding a **headless REST API** at `/api/v1` with **JWT authentication** for external clients (mobile apps, React front-ends, Postman, etc).

---

## 🚀 Setup (4 steps)

```bash
npm install
npm run seed          # 30 products
npm run seed:users    # admin + customer accounts
npm run dev
```

Open → **http://localhost:3000/api/v1** (API docs in JSON)

---

## 🌐 API Endpoints

### Public (no token needed)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1` | API docs |
| POST | `/api/v1/auth/login` | Get JWT token |
| GET | `/api/v1/products` | List products (pagination, filters) |
| GET | `/api/v1/products/:id` | Single product |

### Protected (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/user/profile` | Your profile + order stats |
| POST | `/api/v1/orders` | Place a new order |
| GET | `/api/v1/orders` | Your order history |

---

## 🔑 How to Use the API (Step-by-Step with Postman)

### Step 1: Get a JWT token

```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "customer@uniworth.com",
  "password": "customer123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome back, John Customer!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "1h",
  "user": {
    "id": "...",
    "name": "John Customer",
    "email": "customer@uniworth.com",
    "role": "customer"
  }
}
```

### Step 2: Copy the token

### Step 3: Use it in protected requests

```
GET http://localhost:3000/api/v1/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 API Examples

### Get all products (with filters)

```
GET /api/v1/products
GET /api/v1/products?page=2
GET /api/v1/products?search=polo
GET /api/v1/products?category=Blazers
GET /api/v1/products?minPrice=2000&maxPrice=8000
GET /api/v1/products?sort=price-low
GET /api/v1/products?search=shirt&category=Casual%20Shirts&page=1&limit=5
```

**Response:**
```json
{
  "success": true,
  "pagination": {
    "currentPage": 1,
    "totalPages": 4,
    "totalProducts": 30,
    "limit": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "products": [...]
}
```

### Get single product

```
GET /api/v1/products/675a3f2b1234567890abcdef
```

### Place an order (JWT required)

```
POST /api/v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    { "productId": "675a3f2b1234567890abcdef", "quantity": 2 },
    { "productId": "675a3f2b1234567890abcdee", "quantity": 1 }
  ],
  "shippingAddress": {
    "street": "123 Gulberg III",
    "city": "Lahore",
    "country": "Pakistan"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully!",
  "order": {
    "id": "...",
    "status": "pending",
    "totalAmount": 7497,
    "items": [...],
    "createdAt": "2026-05-17T..."
  }
}
```

### Get user profile (JWT required)

```
GET /api/v1/user/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "John Customer",
    "email": "customer@uniworth.com",
    "role": "customer",
    "memberSince": "2026-05-17T..."
  },
  "stats": {
    "totalOrders": 3
  },
  "recentOrders": [...]
}
```

---

## 🛡️ JWT Flow

```
Client                          Server
  │                               │
  │  POST /api/v1/auth/login      │
  │  { email, password }  ──────► │
  │                               │  bcrypt.compare(password, hash)
  │                               │  jwt.sign({ user_id, role }, SECRET)
  │  ◄────────── { token }        │
  │                               │
  │  GET /api/v1/user/profile     │
  │  Authorization: Bearer <tok>  │
  │  ─────────────────────────► │
  │                               │  verifyToken middleware
  │                               │  jwt.verify(token, SECRET)
  │                               │  req.user = decoded payload
  │  ◄────── { user data }        │
```

---

## ❌ Error Responses

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — missing/invalid data |
| 401 | Unauthorized — no token or expired token |
| 403 | Forbidden — valid token but wrong role |
| 404 | Not Found — resource doesn't exist |
| 500 | Server Error |

**Example 401:**
```json
{
  "success": false,
  "message": "401 Unauthorized — No token provided. Include: Authorization: Bearer <token>"
}
```

**Example 403 (expired):**
```json
{
  "success": false,
  "message": "401 Unauthorized — Token has expired. Please log in again."
}
```

---

## 📁 New Files in This Assignment

```
lab-assignment-4/
├── middleware/
│   └── verifyToken.js            # 🆕 JWT middleware
├── models/
│   └── Order.js                  # 🆕 Order schema
├── controllers/api/
│   ├── authController.js         # 🆕 apiLogin → returns JWT
│   ├── productsController.js     # 🆕 getAllProducts, getProductById
│   ├── ordersController.js       # 🆕 createOrder, getMyOrders
│   └── userController.js         # 🆕 getProfile
└── routes/api/
    └── index.js                  # 🆕 all /api/v1 routes
```

---

## ✅ Assignment Requirements Coverage

| Requirement | Status |
|-------------|--------|
| `GET /api/v1/products` (public, with pagination/filters) | ✅ |
| `GET /api/v1/products/:id` (public) | ✅ |
| `POST /api/v1/orders` (JWT-protected) | ✅ |
| `GET /api/v1/user/profile` (JWT-protected) | ✅ |
| `POST /api/v1/auth/login` returns JWT | ✅ |
| Token payload has `user_id` and `role` | ✅ |
| `JWT_SECRET` in `.env` | ✅ |
| Token expiration (1h) | ✅ |
| `verifyToken` middleware | ✅ |
| Extracts from `Authorization: Bearer` header | ✅ |
| Appends decoded user to `req.user` | ✅ |
| Returns 401 for missing/expired token | ✅ |
| Returns 403 for invalid token | ✅ |
| **Bonus:** `GET /api/v1/orders` history | ✅ |
| **Bonus:** Full API docs at `GET /api/v1` | ✅ |
| **Bonus:** Order model with stock deduction | ✅ |

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `jwt is not defined` | Run `npm install` |
| `401 No token provided` | Add header: `Authorization: Bearer <token>` |
| `401 Token expired` | Login again to get a fresh token |
| `Cannot POST /api/v1/orders` | Make sure body is JSON with `Content-Type: application/json` |
| Product not found in order | Run `npm run seed` to populate products |

---

## 📊 Complete Course Progress

| # | Task | Status |
|---|------|--------|
| 1 | Assignment 1 — Landing Page | ✅ |
| 2 | Lab Task 1 — Responsive | ✅ |
| 3 | Assignment 2 — Hamburger Menu | ✅ |
| 4 | Lab Task 2 — Express + EJS | ✅ |
| 5 | Assignment 3 — MongoDB + Products | ✅ |
| 6 | Assignment 4 — Admin Panel + Multer | ✅ |
| 7 | Lab Assignment 3 — Auth + RBAC | ✅ |
| 8 | Lab Assignment 4 — REST API + JWT | ✅ |

🎉 **All assignments complete!**
