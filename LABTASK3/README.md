# Uniworth Express App 🛍️

Uniworth landing page converted into a full **Express.js** web application with **EJS** templating.

## Project Structure

```
uniworth-express/
├── server.js              ← Main Express server
├── package.json           ← Dependencies
├── views/                 ← EJS page templates
│   ├── index.ejs          ← Home / Landing page
│   ├── about.ejs          ← About Us page
│   ├── contact.ejs        ← Contact page
│   └── shop.ejs           ← Shop page
├── public/                ← Static files (served automatically)
│   ├── css/
│   │   └── style.css      ← All styles
│   └── js/
│       └── main.js        ← Carousel & tab JS
└── asset/                 ← Your image assets (copy your folder here)
    └── asset/
        ├── Slider.jpg1.webp
        ├── prod1.webp ... etc
```

## Setup

1. **Copy your `asset` folder** into this project root (same level as server.js)

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

## Routes

| Route | Page |
|-------|------|
| `http://localhost:3000/` | Home (Landing Page) |
| `http://localhost:3000/about` | About Us |
| `http://localhost:3000/contact` | Contact Us |
| `http://localhost:3000/shop` | Shop |

## What Changed from Plain HTML

| Before | After |
|--------|-------|
| Plain `index.html` | `views/index.ejs` (EJS template) |
| `style.css` in root | `public/css/style.css` (served as static) |
| Inline `<script>` | `public/js/main.js` (served as static) |
| No routing | Express routes: `/`, `/about`, `/contact`, `/shop` |
| No server | `server.js` with Express + EJS |
