const db = require("../config/db");

const deposit = async (req, res) => {
    try {
        const { account_number, amount } = req.body;

        if (!account_number || !amount) {
            return res.status(400).json({
                message: "Account number and amount are required"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0"
            });
        }

        const [accounts] = await db.query(
            `SELECT id, account_number, balance, status
             FROM accounts
             WHERE account_number = ? AND user_id = ?`,
            [account_number, req.user.id]
        );

        if (accounts.length === 0) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        const account = accounts[0];

        if (account.status !== "active") {
            return res.status(400).json({
                message: "Account is not active"
            });
        }

        await db.query(
            `UPDATE accounts
             SET balance = balance + ?
             WHERE account_number = ?`,
            [amount, account_number]
        );

        await db.query(
            `INSERT INTO transactions
             (from_account, to_account, amount, type)
             VALUES (?, ?, ?, ?)`,
            [account_number, null, amount, "deposit"]
        );

        const [updatedAccounts] = await db.query(
            `SELECT account_number, balance, status
             FROM accounts
             WHERE account_number = ?`,
            [account_number]
        );

        res.status(200).json({
            message: "Deposit successful",
            account: updatedAccounts[0]
        });

    } catch (error) {
        console.error("Deposit error:", error);

        res.status(500).json({
            message: "Deposit failed"
        });
    }
};
const withdraw = async (req, res) => {
    try {
        const { account_number, amount } = req.body;

        if (!account_number || !amount || amount <= 0) {
            return res.status(400).json({
                message: "Valid account number and amount are required"
            });
        }

        const [accounts] = await db.query(
            `SELECT id, account_number, balance, status
             FROM accounts
             WHERE account_number = ? AND user_id = ?`,
            [account_number, req.user.id]
        );

        if (accounts.length === 0) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        const account = accounts[0];

        if (account.status !== "active") {
            return res.status(400).json({
                message: "Account is not active"
            });
        }

        if (Number(account.balance) < Number(amount)) {
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        await db.query(
            `UPDATE accounts
             SET balance = balance - ?
             WHERE account_number = ?`,
            [amount, account_number]
        );

        await db.query(
            `INSERT INTO transactions
             (from_account, to_account, amount, type)
             VALUES (?, ?, ?, ?)`,
            [account_number, null, amount, "withdraw"]
        );

        const [updatedAccount] = await db.query(
            `SELECT account_number, balance, status
             FROM accounts
             WHERE account_number = ?`,
            [account_number]
        );

        res.json({
            message: "Withdrawal successful",
            account: updatedAccount[0]
        });

    } catch (error) {
        console.error("Withdraw error:", error);

        res.status(500).json({
            message: "Withdrawal failed"
        });
    }
};
const transfer = async (req, res) => {
    try {
        const { from_account, to_account, amount } = req.body;

        if (!from_account || !to_account || !amount || amount <= 0) {
            return res.status(400).json({
                message: "Valid accounts and amount are required"
            });
        }

        if (from_account === to_account) {
            return res.status(400).json({
                message: "Cannot transfer to the same account"
            });
        }

        const [senderRows] = await db.query(
            `SELECT id, account_number, balance, status
             FROM accounts
             WHERE account_number = ? AND user_id = ?`,
            [from_account, req.user.id]
        );

        if (senderRows.length === 0) {
            return res.status(404).json({
                message: "Sender account not found"
            });
        }

        const sender = senderRows[0];

        if (sender.status !== "active") {
            return res.status(400).json({
                message: "Sender account is not active"
            });
        }

        if (Number(sender.balance) < Number(amount)) {
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        const [receiverRows] = await db.query(
            `SELECT id, account_number, status
             FROM accounts
             WHERE account_number = ?`,
            [to_account]
        );

        if (receiverRows.length === 0) {
            return res.status(404).json({
                message: "Receiver account not found"
            });
        }

        if (receiverRows[0].status !== "active") {
            return res.status(400).json({
                message: "Receiver account is not active"
            });
        }

        await db.query(
            `UPDATE accounts
             SET balance = balance - ?
             WHERE account_number = ?`,
            [amount, from_account]
        );

        await db.query(
            `UPDATE accounts
             SET balance = balance + ?
             WHERE account_number = ?`,
            [amount, to_account]
        );

        await db.query(
            `INSERT INTO transactions
             (from_account, to_account, amount, type)
             VALUES (?, ?, ?, ?)`,
            [from_account, to_account, amount, "transfer"]
        );

        res.json({
            message: "Transfer successful",
            from_account,
            to_account,
            amount
        });

    } catch (error) {
        console.error("Transfer error:", error);

        res.status(500).json({
            message: "Transfer failed"
        });
    }
};

const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, date } = req.query;

        let sql = `
            SELECT DISTINCT
                t.id,
                t.from_account,
                t.to_account,
                t.amount,
                t.type
            FROM transactions t
            JOIN accounts a
                ON a.account_number = t.from_account
                OR a.account_number = t.to_account
            WHERE a.user_id = ?
        `;

        const params = [userId];

        if (type) {
            sql += " AND t.type = ?";
            params.push(type);
        }

        if (date) {
            sql += " AND DATE(t.timestamp) = ?";
            params.push(date);
        }

        sql += " ORDER BY t.id DESC";

        const [transactions] = await db.query(sql, params);

        res.json({
            message: "Transactions fetched successfully",
            transactions
        });

    } catch (error) {
        console.error("Get transactions error:", error);

        res.status(500).json({
            message: "Failed to fetch transactions"
        });
    }
};
       
module.exports = {
    deposit,
    withdraw,
    transfer,
    getTransactions
};