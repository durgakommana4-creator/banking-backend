const express = require("express");
const { deposit, withdraw, transfer, getTransactions } = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/deposit", authMiddleware, deposit);
router.post("/withdraw", authMiddleware, withdraw);
router.post("/transfer", authMiddleware, transfer);
router.get("/", authMiddleware, getTransactions);
module.exports = router;