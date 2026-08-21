const express = require("express");

const {
    getDashboard,
    getAllUsers,
    getAllAccounts,
    getAllTransactions
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    authMiddleware,
    adminMiddleware,
    getDashboard
);

router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    getAllUsers
);

router.get(
    "/accounts",
    authMiddleware,
    adminMiddleware,
    getAllAccounts
);

router.get(
    "/transactions",
    authMiddleware,
    adminMiddleware,
    getAllTransactions
);

module.exports = router;