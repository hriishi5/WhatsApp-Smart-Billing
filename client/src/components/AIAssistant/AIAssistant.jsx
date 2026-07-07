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

              <h2>AI Sales Assistant</h2>

              <button
                onClick={() => setOpen(false)}
              >
                ✕
              </button>

            </div>

            {loading ? (

              <div className="ai-loading">

                <div className="loader"></div>

                <p>Analyzing today's sales...</p>

              </div>

            ) : (

              <>

  <div className="ai-greeting">

    <h3>
      {greeting},{" "}
      {settings?.ownerName || "Owner"} 👋
    </h3>

    <p>
      Here's your business summary for today.
    </p>

  </div>

  <div className="today-summary">

    <h4>📅 Today's Summary</h4>

    <div className="summary-row">

      <span>💰 Revenue Collected</span>

      <strong>
        ₹{totalRevenue.toLocaleString("en-IN")}
      </strong>

    </div>

    <div className="summary-row">

      <span>🛒 Orders Processed</span>

      <strong>
        {todaysOrders || totalOrders}
      </strong>

    </div>

    <div className="summary-row">

     <span>📦 Most Ordered Product</span>

<div
  style={{
    textAlign: "right"
  }}
>

  <strong>{mostOrderedProduct}</strong>

  <br />

  <small
    style={{
      color: "#64748b"
    }}
  >
    {totalOrdersForProduct} Orders
  </small>

</div>

    </div>

    <div className="summary-row">

      <span>⚠ Pending Collection</span>

      <strong>
        ₹{pendingAmount.toLocaleString("en-IN")}
      </strong>

    </div>

    <div className="summary-row">

      <span>📈 Collection Rate</span>

      <strong>
        {collectionRate}%
      </strong>

    </div>

  </div>

  <div className="recommendation">

    <h4>💡 AI Recommendations</h4>

    <ul>

      {pendingInvoices.length > 0 && (

        <li>

          Send payment reminders to{" "}
          {pendingInvoices.length} customer(s).

        </li>

      )}

      <li>

  {mostOrderedProduct} is the most ordered product today, appearing in{" "}
  <strong>{totalOrdersForProduct}</strong> order(s).

</li>

      <li>

        Collection rate is{" "}
        <strong>{collectionRate}%</strong>.

      </li>

      {pendingInvoices.length === 0 ? (

        <li>

          Great work! No pending invoices.

        </li>

      ) : (

        <li>

          Follow up on pending invoices today.

        </li>

      )}

    </ul>

  </div>

  <div className="business-health">

    <span>Business Health</span>

    <strong style={{ color }}>

      {health}

    </strong>

  </div>

</>

            )}

          </div>

        </div>

      )}

    </>

  );

}

export default AIAssistant;