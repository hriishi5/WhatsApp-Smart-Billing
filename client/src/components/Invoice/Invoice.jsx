import "./Invoice.css";
import QRCode from "react-qr-code";
import { FaTrash } from "react-icons/fa";
import { generateInvoice } from "../../utils/generateInvoice";

function Invoice({
    invoice,
    onToggleStatus,
    onDelete,
    settings
}) {
  
  
  
    if (!invoice) {
  return (
    <div className="invoice-card empty-invoice">

      <div className="empty-icon">
        🧾
      </div>

      <h2>No Invoice Selected</h2>

      <p>
        Generate a new invoice or select one from
        the Invoice History.
      </p>

    </div>
  );
}

  return (
    <div className="invoice-card">
      <h2>🧾 Smart Invoice</h2>

      <div className="invoice-row">
        <span>Invoice</span>
        <strong>#{invoice.invoiceId}</strong>
      </div>

      <div className="invoice-row">
        <span>Customer</span>
        <strong>{invoice.customer}</strong>
      </div>
      <div className="invoice-row">
        <span>Phone</span>
        <strong>{invoice.phone}</strong>
      </div>

      <div className="invoice-items">
        <h4>🍽 Ordered Items</h4>

        <ul>
          {invoice.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="invoice-row">
        <span>Total Amount</span>
        <strong>₹{invoice.amount}</strong>
      </div>

      <div className="invoice-row">
        <span>Payment Status</span>

        <strong
          className={
            invoice.status === "Paid"
              ? "paid-status"
              : "pending-status"
          }
        >
          {invoice.status}
        </strong>
      </div>
      {invoice.status === "Pending" && (

      <div className="qr-section">
        <QRCode
  value={`upi://pay?pa=${settings?.upiId || "7899458203@ybl"}&pn=${encodeURIComponent(settings?.businessName || "Home Kitchen")}&am=${invoice.amount}&cu=INR`}
  size={170}
/>

        <p>📱 Scan to Pay</p>

        <p className="upi-id">
  +91 {settings?.phone}
</p>
      </div>)}

      <button
        className="download-btn"
        onClick={() => generateInvoice(invoice, settings)}
      >
        📄 Download Invoice PDF
      </button>

      <button
  className={
    invoice.status === "Paid"
      ? "status-btn reopen"
      : "status-btn confirm"
  }
  onClick={onToggleStatus}
>
  {invoice.status === "Paid"
    ? "↩ Reopen Invoice"
    : "✔ Confirm Payment"}
</button>
      {invoice.status === "Pending" && (
  <button
    className="reminder-btn"
    onClick={() => {

      const message = `Hello ${invoice.customer},

We hope you're doing well.

This is a reminder regarding your pending payment.

Invoice Number : ${invoice.invoiceId}

Amount Due : ₹${invoice.amount}

Please complete the payment at your earliest convenience.

Thank you.

${settings.businessName}

Phone : ${settings.phone}`;

      window.open(
        `https://wa.me/91${invoice.phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

    }}
  >
    Send Reminder
  </button>
)}

      <button
        className="delete-btn"
        onClick={() => {
          if (window.confirm("Delete this invoice?")) {
            onDelete(invoice.invoiceId);
          }
        }}
      >
        <FaTrash />
        Delete Invoice
      </button>
    </div>
  );
}

export default Invoice;