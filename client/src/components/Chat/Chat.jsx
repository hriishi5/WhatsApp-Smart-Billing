import "./Chat.css";

function Chat({
    messages,
    message,
    setMessage,
    handleSend,
    settings,
}) {
  return (
    <>
      {/* Chat Header */}

      <div className="chat-header">
        <div className="seller-avatar">
          🍽
        </div>

        <div>
          <h3>{settings?.businessName || "Home Kitchen"}</h3>
          <p>🟢 Online</p>
        </div>
      </div>

      {/* Messages */}

      <div className="chat-body">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${
              msg.type === "customer"
                ? "customer"
                : "bot"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}

      <div className="chat-input">

        <textarea
          placeholder={`Example:

Rahul
7899458206
2 Paneer Roll
1 Coke
250`}
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
        />

        <button
    className="generate-btn"
    onClick={handleSend}
>
    📤 Generate Invoice
</button>

      </div>
    </>
  );
}

export default Chat;