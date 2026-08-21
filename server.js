const app = require("./src/app");
const db = require("./src/config/db");

const PORT = 5000;

db.query("SELECT 1")
    .then(() => {
        console.log("MySQL connected successfully");
    })
    .catch((error) => {
        console.log("MySQL connection failed:", error.message);
    });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});