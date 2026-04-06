# Express Hello World 🌍

A beginner-friendly Express.js web server project.

## What is Express?

Express is a popular framework for Node.js that makes it easy to build web applications and APIs.

## Prerequisites

- [Node.js](https://nodejs.org/) installed on your computer

## Setup & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   You should see: `Server Started at http://localhost:3000`

## Available Routes

| URL | Response |
|-----|----------|
| http://localhost:3000/ | Home Page |
| http://localhost:3000/contact-us | Contact Us |
| http://localhost:3000/about | About Us |

## How It Works

1. **Import Express** — Bring the library into the project
2. **Create the server** — Initialize the Express app
3. **Define routes** — Tell the server what to do for each URL
4. **Send responses** — Use `res.send()` to reply to the browser
5. **Listen on a port** — Start the server on port 3000

## Stop the Server

Press `Ctrl + C` in your terminal to stop the server.

Happy coding! 🚀
