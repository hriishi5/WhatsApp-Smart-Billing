import { useMemo, useState } from "react";
import "./InvoiceHistoryModal.css";

function InvoiceHistoryModal({
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
      className="history-modal-overlay"
      onClick={onClose}
    >

      <div
        className="history-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}

        <div className="history-modal-header">

          <h2>Invoice History</h2>

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
          className="history-search"
          placeholder="Search customer, phone or invoice..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* List */}

        <div className="history-modal-list">

          {filteredInvoices.length === 0 ? (

            <div className="no-result">

              No invoices found.

            </div>

          ) : (

            filteredInvoices.map((invoice) => (

              <div
                key={invoice.invoiceId}
                className="history-modal-card"
                onClick={() => {

                  onSelectInvoice(invoice);

                  onClose();

                }}
              >

                <div className="history-info">

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

                <div className="history-right">

                  <h3>

                    ₹{invoice.amount}

                  </h3>

                  <span
                    className={
                      invoice.status === "Paid"
                        ? "paid-status"
                        : "pending-status"
                    }
                  >

                    {invoice.status}

                  </span>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>

  );

}

export default InvoiceHistoryModal;