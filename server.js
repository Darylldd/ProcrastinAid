const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.post("/contact", (req, res) => {
  console.log("Message received:", req.body);
  res.send("Thanks for your message! We'll get back to you soon.");
});

app.listen(PORT, () => {
  console.log(`Procrastinaid server running on http://localhost:${PORT}`);
});
