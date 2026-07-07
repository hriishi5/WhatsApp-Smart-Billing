import { useState } from "react";
import "./InvoiceHistory.css";
import InvoiceHistoryModal from "../InvoiceHistoryModal/InvoiceHistoryModal";

function InvoiceHistory({ invoices, onSelectInvoice }) {

  const [showModal, setShowModal] = useState(false);

  return (

    <div className="invoice-history">

     <div className="history-header">

  <div className="history-title">

    <h2>Invoice History</h2>

    <p>
      View and manage all generated invoices.
    </p>

  </div>

  <div className="history-count">

    <span>Total</span>

    <h3>{invoices.length}</h3>

  </div>

</div>

      <div className="history-list">

        {invoices.length === 0 ? (

          <div className="empty-history">

            No invoices found.

          </div>

        ) : (

          <>

            {invoices.slice(0,5).map((invoice)=>(

              <div

                key={invoice.invoiceId}

                className="history-card"

                onClick={()=>onSelectInvoice(invoice)}

              >

                <div className="history-left">

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
                      invoice.status==="Paid"
                      ? "paid"
                      : "pending"
                    }
                  >

                    {invoice.status}

                  </span>

                </div>

              </div>

            ))}

            {invoices.length>5 &&(

              <button

                className="view-all-btn"

                onClick={()=>setShowModal(true)}

              >

                View All

                <span className="view-count">

                  {invoices.length}

                </span>

              </button>

            )}

          </>

        )}

      </div>

      <InvoiceHistoryModal

        open={showModal}

        onClose={()=>setShowModal(false)}

        invoices={invoices}

        onSelectInvoice={onSelectInvoice}

      />

    </div>

  );

}

export default InvoiceHistory;