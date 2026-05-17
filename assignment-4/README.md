# Assignment 4 — E-Commerce Admin Panel (Uniworth)

A secure admin panel built on top of Assignment 3, featuring:
-  Login-protected admin area
-  Dashboard with inventory stats
-  Full CRUD operations on products
-  Image upload with **Multer**
- Delete with confirmation popup
-  Form validation (client + server side)

---

##  Project Structure

```
assignment-4/
├── app.js                            # Main server + MongoDB + sessions
├── package.json
├── .env                              # Config (MongoDB, admin creds, session)
├── .env.example
├── .gitignore
├── README.md
├── models/
│   └── Product.js                    # Mongoose schema
├── middleware/
│   ├── upload.js                     # Multer config (image uploads)
│   └── auth.js                       # Admin auth guard
├── routes/
│   ├── products.js                   # Public /products (from Assignment 3)
│   └── admin/
│       └── index.js                  # Admin CRUD routes
├── seed/
│   └── seedProducts.js               # 30 sample products
├── public/
│   ├── css/
│   │   ├── style.css                 # Store styles
│   │   └── admin.css                 # Admin panel styles
│   ├── js/main.js
│   ├── asset/                        # Static product images
│   └── uploads/                      #  Multer destination
└── views/
    ├── partials/                     # Public site partials
    ├── index.ejs
    ├── products.ejs
    └── admin/
        ├── partials/
        │   ├── header.ejs
        │   ├── sidebar.ejs
        │   └── footer.ejs
        ├── login.ejs                 #  Admin login
        ├── dashboard.ejs             # Stats + product table
        └── product-form.ejs          # Create/Edit form
```

---

##  Setup (6 steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Add your asset images
Copy `.webp` files to `public/asset/` (same as Assignment 3).

### 3. Start MongoDB
Make sure MongoDB is running locally (or update `MONGO_URI` for Atlas in `.env`).

### 4. Seed the database
```bash
npm run seed
```

### 5. Run the server
```bash
npm run dev
```

### 6. Open the admin panel
Go to → **http://localhost:3000/admin/login**

 **Default credentials:**
- Username: `admin`
- Password: `admin123`

---

##  Assignment 4 Features

| Requirement | Implementation |
|-------------|----------------|
|  Separate admin layout | Dedicated sidebar layout (`views/admin/partials/sidebar.ejs`) |
|  Dashboard summary table | Shows Image, Name, Category, Price, Stock, Rating + 5 stat cards |
|  **Create** product | `/admin/products/new` with image upload |
|  **Read** products | Dashboard table at `/admin` |
|  **Update** product | Edit button → pre-filled form, optional image replacement |
|  **Delete** product | Delete button + **JavaScript confirm() popup** |
|  Form validation | Both client-side AND server-side |
|  **Multer** image upload | Saves to `/public/uploads/`, path stored in DB |
|  **Bonus** | Session-based login, stock badges, live table filter, image preview, flash messages |

---

##  Admin Panel Routes

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/admin/login` | Login page |
| POST | `/admin/login` | Process login |
| GET | `/admin/logout` | Logout |
| GET | `/admin` | Dashboard |
| GET | `/admin/products/new` | New product form |
| POST | `/admin/products` | Create product (with image) |
| GET | `/admin/products/:id/edit` | Edit form |
| PUT | `/admin/products/:id` | Update product |
| DELETE | `/admin/products/:id` | Delete product |

> **Note:** Browsers don't natively support PUT/DELETE in forms, so `method-override` is used. Forms POST with `?_method=PUT` or `?_method=DELETE`.

---

##  Image Upload Flow

1. Admin selects an image in the form (`<input type="file" name="image">`)
2. Multer middleware intercepts the request
3. Validates file type (jpg, png, webp, gif) and size (max 5MB)
4. Saves to `public/uploads/` with a unique filename (`name-timestamp-random.ext`)
5. The file path (`/uploads/filename.ext`) is stored in the Product's `image` field
6. When editing, **old uploaded images are auto-deleted** if replaced
7. When deleting a product, its uploaded image is **auto-deleted from disk**

---

##  Try These Workflows

###  Create a product:
1. Login → Click **"Add New Product"**
2. Fill form, upload an image, submit
3. See it appear in the dashboard table immediately

###  Edit a product:
1. Click  **Edit** on any row
2. Modify fields, optionally upload a new image
3. Save → confirmation flash message appears

###  Delete a product:
1. Click  **Delete** on any row
2. **Browser confirm popup** asks for confirmation
3. Click OK → product deleted, image removed from disk

### 🔍 Quick filter:
- Type in the "Quick filter table" search box at top of dashboard
- Rows filter live without page reload

---

##  Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Templating:** EJS with reusable partials
- **File Upload:** Multer
- **Sessions:** express-session
- **Method spoofing:** method-override (for PUT/DELETE)
- **Config:** dotenv

---

##  Troubleshooting

| Issue | Fix |
|-------|-----|
| Can't login | Make sure `.env` has `ADMIN_USER=admin` and `ADMIN_PASS=admin123` |
| Upload fails | Check `public/uploads/` exists and is writable |
| "Cannot find module 'multer'" | Run `npm install` again |
| Old images still on disk | Manual cleanup is only done when product is deleted/updated through admin |
| PUT/DELETE not working | Make sure form has `?_method=PUT` or `?_method=DELETE` and method-override is loaded |

---

##  Security Notes (for production)

This implementation uses simple hardcoded credentials and an in-memory session store for **academic purposes**. In production you'd want to:
- Hash passwords with bcrypt
- Store users in MongoDB (not env vars)
- Use a persistent session store (Redis, connect-mongo)
- Add CSRF protection
- Use HTTPS
- Rate-limit login attempts
