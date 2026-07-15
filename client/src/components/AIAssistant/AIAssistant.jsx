import { useState } from "react";
import "./AIAssistant.css";

function AIAssistant({ invoices, settings }) {

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const totalRevenue = invoices
    .filter(i => i.status === "Paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const pendingAmount = invoices
    .filter(i => i.status === "Pending")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const pendingInvoices =
    invoices.filter(i => i.status === "Pending");

 const totalOrders = invoices.length;

const todaysOrders = invoices.filter((invoice) => {
  if (!invoice.createdAt) return false;

  const today = new Date();
  const date = new Date(invoice.createdAt);

  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear()
  );
}).length;

  // ---------------- Most Ordered Product ----------------

const productCount = {};

invoices.forEach((invoice) => {

  const addedProducts = new Set();

  invoice.items.forEach((item) => {

    const words = item.trim().split(/\s+/);

    let product = "";

    // Example: 2kg Chicken Curry
    if (/^\d+(\.\d+)?[a-zA-Z]+$/i.test(words[0])) {

      product = words.slice(1).join(" ");

    }

    // Example: 2 Dozen Banana
    else if (
      words.length > 2 &&
      !isNaN(words[0])
    ) {

      const possibleUnit = words[1].toLowerCase();

      const units = [
        "kg",
        "gm",
        "g",
        "l",
        "ml",
        "dozen",
        "piece",
        "pieces",
        "pcs",
        "packet",
        "pack",
        "box",
        "boxes",
        "bottle",
        "bottles"
      ];

      if (units.includes(possibleUnit)) {

        product = words.slice(2).join(" ");

      } else {

        product = words.slice(1).join(" ");

      }

    }

    // Example: Coke
    else {

      product = item;

    }

    if (!addedProducts.has(product)) {

      productCount[product] =
        (productCount[product] || 0) + 1;

      addedProducts.add(product);

    }

  });

});

const mostOrderedProduct =
  Object.keys(productCount).length === 0
    ? "No Orders"
    : Object.entries(productCount)
        .sort((a, b) => b[1] - a[1])[0][0];

const totalOrdersForProduct =
  productCount[mostOrderedProduct] || 0;

  const collectionRate =
    invoices.length === 0
      ? 0
      : Math.round(
          (invoices.filter(i => i.status === "Paid").length /
            invoices.length) *
            100
        );

  let health = "Excellent";
  let color = "#16a34a";

  if (collectionRate < 90) {
    health = "Good";
    color = "#f59e0b";
  }

  if (collectionRate < 60) {
    health = "Needs Attention";
    color = "#dc2626";
  }

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 17) greeting = "Good Afternoon";

  const recommendation =
    pendingAmount > 0
      ? `Send reminders to ${pendingInvoices.length} customer(s) to improve today's collection.`
      : "All invoices are paid. Great job!";

  const openAssistant = () => {

    setLoading(true);

    setOpen(true);

    setTimeout(() => {

      setLoading(false);

    }, 1700);

  };

  return (

    <>

      <button
        className="ai-floating-btn"
        onClick={openAssistant}
      >
        🤖
        
      </button>

      {open && (

        <div
          className="ai-overlay"
          onClick={() => setOpen(false)}
        >

          <div
            className="ai-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="ai-header">

              <h2>ApnaKhata AI</h2>

              <button
                onClick={() => setOpen(false)}
              >
                ✕
              </button>

            </div>
            <div className="ai-body">

            {loading ? (

              <div className="ai-loading">

                <div className="loader"></div>

                <p>Analyzing today's sales...</p>

              </div>

            ) : (

           <>
  {/* Greeting */}

  <div className="ai-greeting">
    <h2>
      {greeting}, {settings?.ownerName || "Owner"} 👋
    </h2>

    <p>
      Your AI Business Advisor has analyzed today's business.
    </p>
  </div>

  {/* ================= Daily Report ================= */}

  <div className="report-card">

    <div className="report-title">

      📊 Daily Business Report

    </div>

    <p>

      {invoices.length === 0
        ? "No business activity has been recorded today. Create your first invoice to start receiving AI insights."
        : `Today you completed ${
            todaysOrders || totalOrders
          } order${(todaysOrders || totalOrders) > 1 ? "s" : ""} and collected ₹${totalRevenue.toLocaleString(
            "en-IN"
          )}. ${
            pendingAmount === 0
              ? "Every invoice has been paid, keeping your cash flow healthy."
              : `₹${pendingAmount.toLocaleString(
                  "en-IN"
                )} is still awaiting collection.`
          } Overall, your business performed ${
            health === "Excellent"
              ? "very well"
              : health === "Good"
              ? "well"
              : "below its potential"
          } today.`}

    </p>

  </div>



  {/* ================= Insights ================= */}

  <div className="report-card">

    <div className="report-title">

      🔍 Business Insights

    </div>

    <div className="insight-row">

      <div className="emoji">

        🏆

      </div>

      <div className="insight-content">

        <strong>Today's Best Seller</strong>

        <p>

          {mostOrderedProduct === "No Orders"
            ? "No sales recorded yet."
            : `${mostOrderedProduct} received the highest customer demand today.`}

        </p>

      </div>

    </div>


    <div className="insight-row">

      <div className="emoji">

        💰

      </div>

      <div className="insight-content">

        <strong>Payment Status</strong>

        <p>

          {pendingAmount === 0
            ? "Every invoice has been collected successfully."
            : `${pendingInvoices.length} invoice(s) are still awaiting payment.`}

        </p>

      </div>

    </div>


    <div className="insight-row">

      <div className="emoji">

        ❤️

      </div>

      <div className="insight-content">

        <strong>Business Health</strong>

        <p>{health}</p>

      </div>

    </div>

  </div>



  {/* ================= Next Action ================= */}

  <div className="report-card">

    <div className="report-title">

      ⚡ Next Action

    </div>

    {pendingInvoices.length === 0 ? (

      <div className="success-box">

        <strong>Nothing urgent today.</strong>

        <p>

          Your collections are complete.

          Continue updating your WhatsApp Status tomorrow to keep customers engaged.

        </p>

      </div>

    ) : (

      pendingInvoices.map((invoice) => (

        <div
          key={invoice.invoiceId}
          className="warning-box"
        >

          <strong>

            Follow up with {invoice.customer}

          </strong>

          <p>

            Invoice <b>{invoice.invoiceId}</b>

            <br />

            Pending Amount ₹{invoice.amount}

          </p>

        </div>

      ))

    )}

  </div>
</>

            )}
            </div>

          </div>

        </div>

      )}

    </>

  );

}

export default AIAssistant;