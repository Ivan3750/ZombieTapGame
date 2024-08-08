const express = require("express");
const path = require("path");
const { pool } = require("./db.js");



const router = express.Router();

// Serve login page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../src", "users", "pages", "index.html"), (err) => {
    if (err) {
      res.status(err.status || 500).send("Internal Server Error");
    }
  });
});
router.get("/game", (req, res) => {
  res.sendFile(path.join(__dirname, "../src", "users", "pages", "game.html"), (err) => {
    if (err) {
      res.status(err.status || 500).send("Internal Server Error");
    }
  });
});
router.get("/boost", (req, res) => {
  res.sendFile(path.join(__dirname, "../src", "users", "pages", "boost.html"), (err) => {
    if (err) {
      res.status(err.status || 500).send("Internal Server Error");
    }
  });
});
router.get("/friends", (req, res) => {
  res.sendFile(path.join(__dirname, "../src", "users", "pages", "friends.html"), (err) => {
    if (err) {
      res.status(err.status || 500).send("Internal Server Error");
    }
  });
});
router.get("/skins", (req, res) => {
  res.sendFile(path.join(__dirname, "../src", "users", "pages", "skins.html"), (err) => {
    if (err) {
      res.status(err.status || 500).send("Internal Server Error");
    }
  });
});
router.get("/task", (req, res) => {
  res.sendFile(path.join(__dirname, "../src", "users", "pages", "task.html"), (err) => {
    if (err) {
      res.status(err.status || 500).send("Internal Server Error");
    }
  });
});
router.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../src", "admin", "pages", "admin.html"), (err) => {
    if (err) {
      res.status(err.status || 500).send("Internal Server Error");
    }
  });
});

module.exports = router;