const db = require("../config/db");

const createAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { account_type } = req.body;

        if (!account_type) {
            return res.status(400).json({
                message: "Account type is required"
            });
        }

        if (!["savings", "current"].includes(account_type)) {
            return res.status(400).json({
                message: "Account type must be savings or current"
            });
        }

        const accountNumber =
            "AC" + Date.now().toString().slice(-10);

        const sql = `
            INSERT INTO accounts
            (user_id, account_number, account_type, balance, status)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            userId,
            accountNumber,
            account_type,
            0.00,
            "active"
        ]);

        res.status(201).json({
            message: "Account created successfully",
            account: {
                id: result.insertId,
                account_number: accountNumber,
                account_type: account_type,
                balance: 0.00,
                status: "active"
            }
        });

    } catch (error) {
        console.error("Create account error:", error);

        res.status(500).json({
            message: "Failed to create account",
            error: error.message
        });
    }
};

const getAccounts = async (req, res) => {
    try {
        const userId = req.user.id;

        const [accounts] = await db.query(
            `SELECT id, account_number, account_type, balance, status, created_at
             FROM accounts
             WHERE user_id = ?`,
            [userId]
        );

        res.json({
            message: "Accounts fetched successfully",
            accounts: accounts
        });

    } catch (error) {
        console.error("Get accounts error:", error);

        res.status(500).json({
            message: "Failed to fetch accounts"
        });
    }
}; 

module.exports = {
    createAccount,
    getAccounts
};