const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Local development
      "https://whats-app-smart-billing.vercel.app", // Replace after frontend deployment
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// ---------------- DATABASE ----------------

const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "billing.db")
);

// ---------------- CREATE TABLES ----------------

db.run(`
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoiceId TEXT,
    customer TEXT,
    items TEXT,
    amount INTEGER,
    status TEXT
)
`);
// Users Table
db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)
`);
// Add phone column
db.run(
  `ALTER TABLE invoices ADD COLUMN phone TEXT`,
  (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.log(err.message);
    }
  }
);

// Add createdAt column
db.run(
  `ALTER TABLE invoices ADD COLUMN createdAt TEXT`,
  (err) => {
    if (err && !err.message.includes("duplicate column")) {
      console.log(err.message);
    }
  }
);

// Business Settings Table
db.run(`
CREATE TABLE IF NOT EXISTS settings (

    id INTEGER PRIMARY KEY,

    businessName TEXT,

    ownerName TEXT,

    phone TEXT,

    upiNumber TEXT,

    upiId TEXT,

    email TEXT,

    address TEXT,

    logo TEXT

)
`);

// Default Business Settings
db.run(`
INSERT OR IGNORE INTO settings
(
id,
businessName,
ownerName,
phone,
upiNumber,
upiId,
email,
address,
logo
)

VALUES(

1,

'Home Kitchen',

'Hrishi',

'7899458203',

'7899458203',

'7899458203@ybl',

'support@homekitchen.com',

'Mangalore',

''

)
`);

// ---------------- HOME ----------------

app.get("/", (req, res) => {
    res.send("Backend Running 🚀");
});

// ---------------- REGISTER ----------------

app.post("/register", async (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {

      if (err) {
        return res.status(500).json(err);
      }

      if (user) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        `INSERT INTO users(name, email, password)
         VALUES(?,?,?)`,
        [name, email, hashedPassword],
        function (err) {

          if (err) {
            return res.status(500).json(err);
          }

          res.json({
            success: true,
            message: "User registered successfully",
          });

        }
      );

    }
  );

});
// ---------------- GENERATE INVOICE ID ----------------

function generateInvoiceId(callback) {

    db.get(
        "SELECT businessName FROM settings WHERE id=1",
        [],
        (err, setting) => {

            if (err) {
                return callback(err);
            }

            const businessCode = (setting?.businessName || "COS")
                .replace(/[^A-Za-z]/g, "")
                .substring(0, 3)
                .toUpperCase();

            const now = new Date();

            const year =
                now
                    .getFullYear()
                    .toString()
                    .slice(-2);

            const month =
                String(now.getMonth() + 1)
                    .padStart(2, "0");

            const prefix =
                `${businessCode}-${year}${month}`;

            db.get(

                `SELECT invoiceId
                 FROM invoices
                 WHERE invoiceId LIKE ?
                 ORDER BY id DESC
                 LIMIT 1`,

                [`${prefix}-%`],

                (err, row) => {

                    if (err) {
                        return callback(err);
                    }

                    let sequence = 1;

                    if (row && row.invoiceId) {

                        const last =
                            parseInt(
                                row.invoiceId.split("-")[2]
                            );

                        sequence = last + 1;

                    }

                    const invoiceId =
                        `${prefix}-${String(sequence).padStart(4, "0")}`;

                    callback(null, invoiceId);

                }

            );

        }

    );

}

// ---------------- SAVE INVOICE ----------------

app.post("/invoice", (req, res) => {

   const {

    customer,

    phone,

    items,

    amount,

    status,

    createdAt

} = req.body;

    console.log("Saving Invoice:", req.body);

    generateInvoiceId((err, invoiceId) => {

    if (err) {

        console.log(err);

        return res.status(500).json(err);

    }

    db.run(

        `INSERT INTO invoices
        (
            invoiceId,
            customer,
            phone,
            items,
            amount,
            status,
            createdAt
        )
        VALUES(?,?,?,?,?,?,?)`,

        [

            invoiceId,

            customer,

            phone,

            JSON.stringify(items),

            amount,

            status,

            createdAt

        ],

        function(err){

            if(err){

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({

                success:true,

                invoiceId,

                id:this.lastID

            });

        }

    );

});

});

// ---------------- GET ALL INVOICES ----------------

app.get("/invoices", (req, res) => {

    db.all(

        "SELECT * FROM invoices ORDER BY id DESC",

        [],

        (err, rows) => {

            if(err){
                return res.status(500).json(err);
            }

            rows.forEach((row)=>{

                row.items = JSON.parse(row.items);

            });

            res.json(rows);

        }

    );

});

// ---------------- MARK AS PAID ----------------

app.put("/invoice/:invoiceId", (req, res) => {

  const { status } = req.body;

  db.run(
    `UPDATE invoices
     SET status=?
     WHERE invoiceId=?`,
    [status, req.params.invoiceId],
    function(err){

      if(err){
        return res.status(500).json(err);
      }

      res.json({ success:true });

    }
  );

});

// ---------------- DELETE INVOICE ----------------

app.delete("/invoice/:invoiceId", (req, res) => {

    const invoiceId = req.params.invoiceId;

    db.run(

        "DELETE FROM invoices WHERE invoiceId=?",

        [invoiceId],

        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                success:true
            });

        }

    );

});

// ---------------- GET SETTINGS ----------------

app.get("/settings", (req, res) => {

    db.get(

        "SELECT * FROM settings WHERE id=1",

        [],

        (err,row)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json(row);

        }

    );

});

// ---------------- UPDATE SETTINGS ----------------

app.put("/settings", (req, res) => {

    const {

        businessName,
        ownerName,
        phone,
        upiNumber,
        upiId,
        email,
        address,
        logo

    } = req.body;

    db.run(

        `UPDATE settings SET

        businessName=?,
        ownerName=?,
        phone=?,
        upiNumber=?,
        upiId=?,
        email=?,
        address=?,
        logo=?

        WHERE id=1`,

        [

            businessName,
            ownerName,
            phone,
            upiNumber,
            upiId,
            email,
            address,
            logo

        ],

        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                success:true
            });

        }

    );

});

// ---------------- START SERVER ----------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});