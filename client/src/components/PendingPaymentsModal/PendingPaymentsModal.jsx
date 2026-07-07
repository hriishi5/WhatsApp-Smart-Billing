import { useMemo, useState } from "react";
import "./PendingPaymentsModal.css";

function PendingPaymentsModal({
  open,
  onClose,
  invoices,
  onSelectInvoice,
}) {
  const [search, setSearch] = useState("");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const query = search.toLowerCase();

      return (
        invoice.customer.toLowerCase().includes(query) ||
        invoice.invoiceId.toLowerCase().includes(query) ||
        (invoice.phone || "").includes(query)
      );
    });
  }, [search, invoices]);

  if (!open) return null;

  return (
    <div
      className="pending-modal-overlay"
      onClick={onClose}
    >
      <div
        className="pending-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}

        <div className="pending-modal-header">
          <h2>Pending Payments</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Search */}

        <input
          type="text"
          placeholder="Search customer, phone or invoice..."
          className="pending-search"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* List */}

        <div className="pending-modal-list">

          {filteredInvoices.length === 0 ? (

            <div className="no-result">
              No pending invoices found.
            </div>

          ) : (

            filteredInvoices.map((invoice) => {

              let pendingDays = "Today";

              if (invoice.createdAt) {

                const diff = Math.floor(
                  (Date.now() -
                    new Date(invoice.createdAt)) /
                    (1000 * 60 * 60 * 24)
                );

                if (diff > 0) {
                  pendingDays = `${diff} day(s)`;
                }

              }

              return (

                <div
                  key={invoice.invoiceId}
                  className="pending-modal-card"
                  onClick={() => {
                    onSelectInvoice(invoice);
                    onClose();
                  }}
                >
                  <div className="pending-info">

                    <h4>
                      {invoice.customer}
                    </h4>

                    <p>
                      {invoice.phone}
                    </p>

                    <small>
                      {invoice.invoiceId}
                    </small>

                  </div>

                  <div className="pending-right">

                    <h3>
                      ₹{invoice.amount}
                    </h3>

                    <span>
                      Pending {pendingDays}
                    </span>

                  </div>

                </div>

              );

            })

          )}

        </div>

      </div>
    </div>
  );
}

export default PendingPaymentsModal;