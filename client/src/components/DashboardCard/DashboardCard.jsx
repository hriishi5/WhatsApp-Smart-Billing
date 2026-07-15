import "./DashboardCard.css";
import { useState } from "react";
import PendingPaymentsModal from "../PendingPaymentsModal/PendingPaymentsModal";

function Dashboard({ invoices, onSelectInvoice }) {
  // ---------------- Statistics ----------------
  const [showTopProducts, setShowTopProducts] = useState(false);
const [showPendingModal, setShowPendingModal] =
useState(false);
  const totalRevenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const pendingAmount = invoices
    .filter((i) => i.status === "Pending")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalOrders = invoices.length;

  // ---------------- Top Item ----------------
// ---------------- Top Selling Products ----------------

const productCount = {};

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
  "bottles",
];

invoices.forEach((invoice) => {

  const addedProducts = new Set();

  invoice.items.forEach((item) => {

    const words = item.trim().split(/\s+/);

    let product = "";

    // Example: 2kg Chicken Curry
    if (/^\d+(\.\d+)?[a-zA-Z]+$/i.test(words[0])) {

      product = words.slice(1).join(" ");

    }

    // Example: 2 Dozen Eggs
    else if (
      words.length > 2 &&
      !isNaN(words[0]) &&
      units.includes(words[1].toLowerCase())
    ) {

      product = words.slice(2).join(" ");

    }

    // Example: 2 Fries
    else if (!isNaN(words[0])) {

      product = words.slice(1).join(" ");

    }

    // Example: Coke
    else {

      product = item;

    }

    product = product.trim();

    // Count only once per invoice
    if (!addedProducts.has(product)) {

      productCount[product] =
        (productCount[product] || 0) + 1;

      addedProducts.add(product);

    }

  });

}); 

const rankedProducts = Object.entries(productCount)
  .sort((a, b) => b[1] - a[1]);

// Highest 3 unique order counts
const uniqueCounts = [
  ...new Set(rankedProducts.map(([, count]) => count))
];

const topThreeCounts = uniqueCounts.slice(0, 3);

// Include every tied product
const topProducts = rankedProducts.filter(
  ([, count]) => topThreeCounts.includes(count)
);

// Medal mapping
const medalMap = {};

topThreeCounts.forEach((count, index) => {

  medalMap[count] =
    index === 0
      ? "🥇"
      : index === 1
      ? "🥈"
      : "🥉";

});


  // ---------------- Pending ----------------

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "Pending"
  );

  const collectionRate =
    invoices.length === 0
      ? 0
      : Math.round(
          (invoices.filter(
            (i) => i.status === "Paid"
          ).length /
            invoices.length) *
            100
        );

  return (
    <div className="dashboard">

      {/* Header */}

      <div className="dashboard-header">

        <h2>Financial Dashboard</h2>

        <p>
          Monitor revenue and outstanding payments.
        </p>

      </div>

      {/* Top Cards */}

      <div className="dashboard-cards">

        <div className="dashboard-card">

          <span>Total Revenue</span>

          <h2>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </h2>

        </div>

        <div className="dashboard-card">

          <span>Pending</span>

          <h2>
            ₹{pendingAmount.toLocaleString("en-IN")}
          </h2>

        </div>

        <div className="dashboard-card">

          <span>Total Orders</span>

          <h2>{totalOrders}</h2>

        </div>

       <div className="dashboard-card">

    <span>Top Selling</span>

    <h2>

        {topProducts.length === 0
            ? "-"
            : `${topProducts.length} Product${topProducts.length > 1 ? "s" : ""}`}

    </h2>

    {topProducts.length > 0 && (

        <button
            className="view-products-btn"
            onClick={() => setShowTopProducts(true)}
        >
            View →
        </button>

    )}

</div>
      </div>
      

    

      {/* Pending Payments */}

<div className="pending-payments">

  <div className="pending-header">

    <h3>Pending Payments</h3>

    <span>
      {pendingInvoices.length} Pending
    </span>

  </div>

  {pendingInvoices.length === 0 ? (

    <div className="empty-state">
      <p>✅ You're all caught up! 
      No pending payments.</p>
    </div>

  ) : (

    <>
      {pendingInvoices.slice(0, 2).map((invoice) => {

        let pendingDays = "Today";

        if (invoice.createdAt) {

          const diff = Math.floor(

            (Date.now() - new Date(invoice.createdAt)) /

            (1000 * 60 * 60 * 24)

          );

          if (diff > 0) {

            pendingDays = `${diff} day(s)`;

          }

        }

        

        return (

          <div
            key={invoice.invoiceId}
            className="payment-card"
            onClick={() => onSelectInvoice(invoice)}
          >

            <div>

              <h4>{invoice.customer}</h4>

              <p>{invoice.phone}</p>

              <small>{pendingDays}</small>

            </div>

            <div className="payment-right">

              <h3>₹{invoice.amount}</h3>

            </div>

          </div>

        );

      })}

      {pendingInvoices.length > 2 && (

        <button
          className="view-all-btn"
          onClick={() => setShowPendingModal(true)}
        >

          View All

        </button>

      )}

    </>

  )}

</div>

<PendingPaymentsModal
  open={showPendingModal}
  onClose={() => setShowPendingModal(false)}
  invoices={pendingInvoices}
  onSelectInvoice={onSelectInvoice}
/>

{showTopProducts && (

<div
    className="modal-overlay"
    onClick={() => setShowTopProducts(false)}
>

<div
    className="top-products-modal"
    onClick={(e) => e.stopPropagation()}
>

<h2>🏆 Top Selling Products</h2>

<div className="top-products-list">

{topProducts.map(([product, count]) => {
return(

<div
    key={product}
    className="top-product-row"
>

<div>

<strong>

{medalMap[count]} {product}

</strong>

</div>

<span>

{count} Order{count>1?"s":""}

</span>

</div>

);

})}

</div>

<button
className="close-modal-btn"
onClick={()=>setShowTopProducts(false)}
>

Close

</button>

</div>

</div>

)}

    </div>
  );
}

export default Dashboard;