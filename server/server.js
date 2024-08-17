// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const routes = require("./routes.js");
const api = require("./api.js");
const { startTelegramBot } = require("../bot/run.js");
const { connectDB, disconnectDB } = require("./db.js");

dotenv.config();



const app = express();
const PORT = process.env.PORT || 5000;



// Configure middleware


app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "../src/")));

// Use routes
app.use("/", routes);
app.use("/api", api);

// Handle unsupported methods
app.all("/api/*", (req, res) => {
  res.status(405).json({ message: "Method Not Allowed" });
});
app.all("*/", (req, res) => {
  res.status(405).json({ message: "404" });
});

// Start the server and connect to the database
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();  // Connect to the database
  startTelegramBot(); // Start the Telegram bot
});

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
