require("dotenv").config();
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;


const rateLimit = require("express-rate-limit");


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts"
});

app.use("/login", loginLimiter);

app.use(express.json()); 
app.use(cors({
  origin: "http://localhost:5173"
}));

// Create database
const db = new sqlite3.Database("./users.db", (err) => {
    if (err) console.error(err.message);
    console.log("Connected to database.");
  });
  
  // Create users table
  db.run(`
     CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) return res.status(401).json({ message: "No token" });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
  
      req.user = user;
      next();
    });
  }

  app.get("/dashboard", authenticateToken, (req, res) => {
    res.json({
      message: "Welcome to dashboard",
      user: req.user
    });
  });

const bcrypt = require("bcrypt");

  app.post("/register", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    db.run(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword],
      function (err) {
        if (err) {
          return res.status(400).json({ message: "User already exists" });
        }
  
        res.json({ message: "User registered successfully" });
      }
    );
  });

  app.post("/login", (req, res) => {
    const { email, password } = req.body;
  
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err || !user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
  
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      const token = jwt.sign(
        { id: user.id, email: user.email }, // actual payload
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.json({ token });
    });
  });

  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });