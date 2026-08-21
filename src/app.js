const adminRoutes = require("./routes/adminRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const accountRoutes = require("./routes/accountRoutes");
const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/authRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Banking Backend API is running"
  });
});

module.exports = app;