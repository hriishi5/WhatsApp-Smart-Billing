require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {

    if (err) {
      return res.status(403).json({
        message: "Invalid token",
      });
    }

    req.user = user;

    next();

  });

}

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

// Business Table
db.run(`
CREATE TABLE IF NOT EXISTS businesses (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    userId INTEGER NOT NULL,

    businessName TEXT NOT NULL,

    ownerName TEXT NOT NULL,

    phone TEXT,

    upiId TEXT,

    email TEXT,

    address TEXT

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

db.run(
  `ALTER TABLE invoices ADD COLUMN userId INTEGER`,
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

// ---------------- LOGIN ----------------

app.post("/login", (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {

      if (err) {
        return res.status(500).json(err);
      }

      if (!user) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
  },
  JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

db.get(
  "SELECT * FROM businesses WHERE userId = ?",
  [user.id],
  (err, business) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json({
      success: true,
      message: "Login Successful",
      token,
      hasBusiness: !!business,
      user: {
  id: user.id,
  name: user.name,
  email: user.email,
},
    });
  }
);

    }
  );

});

// ---------------- SAVE BUSINESS ----------------

app.post("/business", authenticateToken, (req, res) => {

  const {
    businessName,
    ownerName,
    phone,
    upiId,
    email,
    address,
} = req.body;

const userId = req.user.id;

  db.get(
  "SELECT * FROM businesses WHERE userId = ?",
  [userId],
  (err, business) => {

    if (err) {
      return res.status(500).json(err);
    }

    if (business) {
      return res.json({
        success: true,
        message: "Business already exists",
      });
    }

    db.run(
      `INSERT INTO businesses
      (
        userId,
        businessName,
        ownerName,
        phone,
        upiId,
        email,
        address
      )
      VALUES(?,?,?,?,?,?,?)`,
      [
        userId,
        businessName,
        ownerName,
        phone,
        upiId,
        email,
        address,
      ],
      function (err) {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({
          success: true,
          message: "Business saved successfully",
        });

      }
    );

  }
);

});

// ---------------- GET BUSINESS ----------------

app.get("/business", authenticateToken, (req, res) => {

  db.get(
    "SELECT * FROM businesses WHERE userId = ?",
    [req.user.id],
    (err, row) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(row);

    }
  );

});

// ---------------- UPDATE BUSINESS ----------------

app.put("/business", authenticateToken, (req,res)=>{

  const {
    businessName,
    ownerName,
    phone,
    upiId,
    email,
    address,
  } = req.body;

  db.run(
    `UPDATE businesses
     SET
       businessName = ?,
       ownerName = ?,
       phone = ?,
       upiId = ?,
       email = ?,
       address = ?
     WHERE userId = ?`,
    [
      businessName,
      ownerName,
      phone,
      upiId,
      email,
      address,
      req.user.id,
    ],
    function (err) {

      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true,
      });

    }
  );

});

// ---------------- GENERATE INVOICE ID ----------------

function generateInvoiceId(userId, callback){

    db.get(
        "SELECT businessName FROM businesses WHERE userId = ?",
        [userId],
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
WHERE userId = ?
AND invoiceId LIKE ?
ORDER BY id DESC
LIMIT 1`,

                [userId, `${prefix}-%`],

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

app.post("/invoice", authenticateToken, (req, res) => {

   const {

  customer,

  phone,

  items,

  amount,

  status,

  createdAt

} = req.body;

const userId = req.user.id;

    console.log("Saving Invoice:", req.body);

    generateInvoiceId(userId, (err, invoiceId) => {

    if (err) {

        console.log(err);

        return res.status(500).json(err);

    }

    db.run(

        `INSERT INTO invoices
(
    invoiceId,
    userId,
    customer,
    phone,
    items,
    amount,
    status,
    createdAt
)
VALUES(?,?,?,?,?,?,?,?)`,

        [

            
    invoiceId,
    userId,
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

app.get("/invoices", authenticateToken, (req, res) => {

    const userId = req.user.id;

    db.all(

        "SELECT * FROM invoices WHERE userId = ? ORDER BY id DESC",

        [userId],

        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            rows.forEach((row) => {
                row.items = JSON.parse(row.items);
            });

            res.json(rows);

        }

    );

});

// ---------------- MARK AS PAID ----------------

app.put("/invoice/:invoiceId",authenticateToken, (req, res) => {

  const { status } = req.body;

  db.run(
    `UPDATE invoices
SET status=?
WHERE invoiceId=?
AND userId=?`,
    [status, req.params.invoiceId, req.user.id],
    function(err){

      if(err){
        return res.status(500).json(err);
      }

      res.json({ success:true });

    }
  );

});

// ---------------- DELETE INVOICE ----------------

app.delete("/invoice/:invoiceId",authenticateToken, (req, res) => {

    const invoiceId = req.params.invoiceId;

    db.run(

        "DELETE FROM invoices WHERE invoiceId=? AND userId=?",

        [invoiceId, req.user.id],

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