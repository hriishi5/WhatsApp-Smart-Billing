import "./Dashboard.css";
import { useState } from "react";
import PendingPaymentsModal from "../PendingPaymentsModal/PendingPaymentsModal";
import { normalizeItem } from "../../utils/normalizeItem";
function Dashboard({ invoices, onSelectInvoice }) {
  // ---------------- Statistics ----------------
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

  // ---------------- Most Ordered Product ----------------

const productCount = {};

invoices.forEach((invoice) => {

  const addedProducts = new Set();

  invoice.items.forEach((item) => {

    const words = item.trim().split(/\s+/);

    let product = "";

    // Example:
    // 2kg Chicken Curry
    if (/^\d+(\.\d+)?[a-zA-Z]+$/.test(words[0])) {

      product = words.slice(1).join(" ");

    }

    // Example:
    // 2 Dozen Banana
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

    // Example:
    // Coke
    else {

      product = item;

    }

    // Count only once per invoice
    if (!addedProducts.has(product)) {

      productCount[product] =
        (productCount[product] || 0) + 1;

      addedProducts.add(product);

    }

  });

});

const mostOrderedProduct =
  Object.keys(productCount).length === 0
    ? "-"
    : Object.entries(productCount)
        .sort((a, b) => b[1] - a[1])[0][0];

const totalOrdersForProduct =
  productCount[mostOrderedProduct] || 0;

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

          <span>Most Ordered</span>

          <>
  

<h2>{mostOrderedProduct}</h2>


</>

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
      No pending payments.
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

    </div>
  );
}

export default Dashboard;