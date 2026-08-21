const db = require("../config/db");

const getDashboard = async (req, res) => {
    try {
        const [[users]] = await db.query(
            "SELECT COUNT(*) AS total_users FROM users"
        );

        const [[accounts]] = await db.query(
            "SELECT COUNT(*) AS total_accounts FROM accounts"
        );

        const [[transactions]] = await db.query(
            "SELECT COUNT(*) AS total_transactions FROM transactions"
        );

        const [[balance]] = await db.query(
            "SELECT COALESCE(SUM(balance), 0) AS total_balance FROM accounts"
        );

        res.json({
            message: "Admin dashboard fetched successfully",
            dashboard: {
                total_users: users.total_users,
                total_accounts: accounts.total_accounts,
                total_transactions: transactions.total_transactions,
                total_balance: balance.total_balance
            }
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);

        res.status(500).json({
            message: "Failed to fetch admin dashboard"
        });
    }
};


// Get all users
const getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC"
        );

        res.json({
            message: "Users fetched successfully",
            users
        });

    } catch (error) {
        console.error("Get all users error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};


// Get all accounts
const getAllAccounts = async (req, res) => {
    try {
        const [accounts] = await db.query(`
            SELECT
                id,
                user_id,
                account_number,
                account_type,
                balance,
                status,
                created_at
            FROM accounts
            ORDER BY id DESC
        `);

        res.json({
            message: "Accounts fetched successfully",
            accounts
        });

    } catch (error) {
        console.error("Get all accounts error:", error);

        res.status(500).json({
            message: "Failed to fetch accounts"
        });
    }
};


// Get all transactions
const getAllTransactions = async (req, res) => {
    try {
        const [transactions] = await db.query(`
            SELECT
                id,
                from_account,
                to_account,
                amount,
                type,
                timestamp
            FROM transactions
            ORDER BY id DESC
        `);

        res.json({
            message: "Transactions fetched successfully",
            transactions
        });

    } catch (error) {
        console.error("Get all transactions error:", error);

        res.status(500).json({
            message: "Failed to fetch transactions"
        });
    }
};


module.exports = {
    getDashboard,
    getAllUsers,
    getAllAccounts,
    getAllTransactions
};