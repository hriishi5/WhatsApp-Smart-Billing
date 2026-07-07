import { useEffect, useState } from "react";

import "./App.css";

import Chat from "./components/Chat/Chat";
import Invoice from "./components/Invoice/Invoice";
import Dashboard from "./components/Dashboard/Dashboard";
import InvoiceHistory from "./components/InvoiceHistory/InvoiceHistory";
import BusinessSettings from "./components/BusinessSettings/BusinessSettings";
import AIAssistant from "./components/AIAssistant/AIAssistant";
import { parseOrder } from "./utils/parseOrder";

function App() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Welcome Seller!",
      type: "bot",
    },
  ]);

  const [invoice, setInvoice] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState(null);

  const loadInvoices = () => {
    fetch(`${import.meta.env.VITE_API_URL}/invoices`)
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data);
      })
      .catch((err) => console.log(err));
  };
  const loadSettings = () => {
  fetch(`${import.meta.env.VITE_API_URL}/settings`)
    .then((res) => res.json())
    .then((data) => {
      setSettings(data);
    })
    .catch((err) => console.log(err));
};

  useEffect(() => {
    loadInvoices();
    loadSettings();
  }, []);

  const handleSend = () => {
    if (message.trim() === "") return;

    const order = parseOrder(message);

   const newInvoice = {
  
  customer: order.customer,
  phone: order.phone,
  items: order.items,
  amount: order.amount,
  status: "Pending",
  createdAt: new Date().toISOString(),
};

    fetch(`${import.meta.env.VITE_API_URL}/invoice`, {

  method: "POST",

  headers: {

    "Content-Type": "application/json",

  },

  body: JSON.stringify(newInvoice),

})

  .then((res) => res.json())

  .then((data) => {

    const savedInvoice = {

      ...newInvoice,

      ...data,

    };

    setInvoice(savedInvoice);

    setMessages((prev) => [

      ...prev,

      {

        id: Date.now(),

        invoiceId: data.invoiceId,

        text: message,

        type: "customer",

      },

    ]);

    loadInvoices();

    setMessage("");

  })

  .catch((err) => console.log(err));
  };

 const handleToggleStatus = async () => {

  if (!invoice) return;

  const newStatus =
    invoice.status === "Paid"
      ? "Pending"
      : "Paid";

  await fetch(
    `${import.meta.env.VITE_API_URL}/invoice/${invoice.invoiceId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    }
  );

  setInvoice({
    ...invoice,
    status: newStatus,
  });

  loadInvoices();

};

  const handleDelete = async (invoiceId) => {
    await fetch(
        `${import.meta.env.VITE_API_URL}/invoice/${invoiceId}`,
        {
          method: "DELETE",
        }
      );

    setMessages((prev) =>
      prev.filter((msg) => msg.invoiceId !== invoiceId)
    );

    setInvoice(null);

    loadInvoices();
  };

  return (
    <div className="app">
      {/* Header */}

      <header className="topbar">

  <div className="brand">

    <h1>
      {settings
        ? settings.businessName
        : "Loading..."}
    </h1>

    <p>
      WhatsApp Smart Billing Platform
    </p>

  </div>

  <div className="header-stats">

    <div>

      <span>Orders</span>

      <strong>{invoices.length}</strong>

    </div>

    <div>

      <span>Status</span>

      <strong className="online">

        ● Online

      </strong>

    </div>

    <button
      className="settings-btn"
      onClick={() => setShowSettings(true)}
    >
      ⚙ Settings
    </button>

  </div>

</header>
      {/* Main Layout */}

      <main className="main-layout">
        {/* Chat */}

        <section className="chat-panel">
          <Chat
    messages={messages}
    message={message}
    setMessage={setMessage}
    handleSend={handleSend}
    settings={settings}
/>
        </section>

        {/* Invoice */}

        <section className="invoice-panel">
          <Invoice
  invoice={invoice}
  settings={settings}
  onDelete={handleDelete}
  onToggleStatus={handleToggleStatus}
/>
        </section>

        {/* Dashboard */}

        <section className="dashboard-panel">
          <Dashboard
            invoices={invoices}
            onSelectInvoice={setInvoice}
          />
        </section>
      </main>

      {/* Invoice History */}

      <section className="history-panel">
        <InvoiceHistory
          invoices={invoices}
          onSelectInvoice={setInvoice}
        />
      </section>
      {showSettings && (

  <BusinessSettings

    onClose={() => setShowSettings(false)}

    onSave={(data) => {

      setSettings(data);

      loadSettings();

    }}

  />

)}
<AIAssistant
    invoices={invoices}
    settings={settings}
/>
    </div>
  );
}

export default App; 