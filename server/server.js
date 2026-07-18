require("dotenv").config();
const pool = require("./db");
const express = require("express");
const cors = require("cors");

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


// ---------------- HOME ----------------

app.get("/", (req, res) => {
    res.send("Backend Running 🚀");
});

// ---------------- REGISTER ----------------

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("📩 Register Request:", req.body);

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users
(
    name,
    email,
    password
    
)
VALUES
(
    $1,
    $2,
    $3
    
)`,
      [name, email, hashedPassword]
    );
    console.log("✅ User inserted into Supabase");

    res.json({
      success: true,
      message: "User registered successfully",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});

// ---------------- LOGIN ----------------

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    // JWT
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

    // Check if business exists
    const businessResult = await pool.query(
      "SELECT * FROM businesses WHERE userid = $1",
      [user.id]
    );

    res.json({
      success: true,
      message: "Login Successful",
      token,
      hasBusiness: businessResult.rows.length > 0,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        language:user.language
      },
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});

// ---------------- SAVE BUSINESS ----------------

app.post("/business", authenticateToken, async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      phone,
      upiId,
      email,
      address,
    } = req.body;

    const userId = req.user.id;

    // Check if business already exists
    const existingBusiness = await pool.query(
      "SELECT * FROM businesses WHERE userid = $1",
      [userId]
    );

    if (existingBusiness.rows.length > 0) {
      return res.json({
        success: true,
        message: "Business already exists",
      });
    }

    // Insert business
    await pool.query(
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
      VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [
        userId,
        businessName,
        ownerName,
        phone,
        upiId,
        email,
        address,
      ]
    );

    res.json({
      success: true,
      message: "Business saved successfully",
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});

// ---------------- GET BUSINESS ----------------

app.get("/business", authenticateToken, async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        id,
        userid AS "userId",
        businessname AS "businessName",
        ownername AS "ownerName",
        phone,
        upiid AS "upiId",
        email,
        address
      FROM businesses
      WHERE userid = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});

// ---------------- UPDATE BUSINESS ----------------

app.put("/business", authenticateToken, async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      phone,
      upiId,
      email,
      address,
    } = req.body;

    await pool.query(
      `
      UPDATE businesses
      SET
        businessname = $1,
        ownername = $2,
        phone = $3,
        upiid = $4,
        email = $5,
        address = $6
      WHERE userid = $7
      `,
      [
        businessName,
        ownerName,
        phone,
        upiId,
        email,
        address,
        req.user.id,
      ]
    );

    res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});

// ---------------- GENERATE INVOICE ID ----------------

async function generateInvoiceId(userId) {
  // Get business name
  const businessResult = await pool.query(
    `
    SELECT businessname AS "businessName"
    FROM businesses
    WHERE userid = $1
    `,
    [userId]
  );

  const businessName =
    businessResult.rows[0]?.businessName || "COS";

  const businessCode = businessName
    .replace(/[^A-Za-z]/g, "")
    .substring(0, 3)
    .toUpperCase();

  const now = new Date();

  const year = now.getFullYear().toString().slice(-2);

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const prefix = `${businessCode}-${year}${month}`;

  // Get latest invoice
  const invoiceResult = await pool.query(
    `
    SELECT invoiceid AS "invoiceId"
    FROM invoices
    WHERE userid = $1
      AND invoiceid LIKE $2
    ORDER BY id DESC
    LIMIT 1
    `,
    [userId, `${prefix}-%`]
  );

  let sequence = 1;

  if (invoiceResult.rows.length > 0) {
    const last = parseInt(
      invoiceResult.rows[0].invoiceId.split("-")[2]
    );

    sequence = last + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

// ---------------- SAVE INVOICE ----------------

app.post("/invoice", authenticateToken, async (req, res) => {
  try {
    const {
      customer,
      phone,
      items,
      amount,
      status,
      createdAt,
    } = req.body;

    const userId = req.user.id;

    const invoiceId = await generateInvoiceId(userId);

    await pool.query(
      `
      INSERT INTO invoices
      (
        invoiceid,
        userid,
        customer,
        phone,
        items,
        amount,
        status,
        createdat
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        invoiceId,
        userId,
        customer,
        phone,
        JSON.stringify(items),
        amount,
        status,
        createdAt,
      ]
    );

    res.json({
      success: true,
      invoiceId,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});

// ---------------- GET ALL INVOICES ----------------

app.get("/invoices", authenticateToken, async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        id,
        invoiceid AS "invoiceId",
        userid AS "userId",
        customer,
        phone,
        items,
        amount,
        status,
        createdat AS "createdAt"
      FROM invoices
      WHERE userid = $1
      ORDER BY id DESC
      `,
      [req.user.id]
    );

    const invoices = result.rows.map((invoice) => ({
      ...invoice,
      items: JSON.parse(invoice.items),
    }));

    res.json(invoices);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});
// ---------------- MARK AS PAID ----------------

app.put("/invoice/:invoiceId", authenticateToken, async (req, res) => {
  try {

    const { status } = req.body;

    await pool.query(
      `
      UPDATE invoices
      SET status = $1
      WHERE invoiceid = $2
      AND userid = $3
      `,
      [
        status,
        req.params.invoiceId,
        req.user.id,
      ]
    );

    res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});

// ---------------- DELETE INVOICE ----------------

app.delete("/invoice/:invoiceId", authenticateToken, async (req, res) => {
  try {

    await pool.query(
      `
      DELETE FROM invoices
      WHERE invoiceid = $1
      AND userid = $2
      `,
      [
        req.params.invoiceId,
        req.user.id,
      ]
    );

    res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }
});

// ---------------- UPDATE USER LANGUAGE ----------------

app.put("/language", authenticateToken, async (req, res) => {

  try {

    const { language } = req.body;

    await pool.query(
      `
      UPDATE users
      SET language = $1
      WHERE id = $2
      `,
      [
        language,
        req.user.id,
      ]
    );

    res.json({
      success: true,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error",
    });

  }

});

pool.query("SELECT NOW()")
  .then((result) => {
    console.log("✅ Connected to Supabase!");
    console.log("Database Time:", result.rows[0].now);
  })
  .catch((err) => {
    console.error("❌ Supabase Connection Failed:", err.message);
  });

// ---------------- START SERVER ----------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});