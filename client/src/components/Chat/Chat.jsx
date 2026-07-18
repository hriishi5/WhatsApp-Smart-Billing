import "./Chat.css";
import { useLanguage } from "../../context/LanguageContext";
function Chat({
    messages,
    message,
    setMessage,
    handleSend,
    settings,
    user,
}) { 

  const colors = [
  { start: "#14B8A6", end: "#0F766E" },
  { start: "#3B82F6", end: "#1D4ED8" },
  { start: "#8B5CF6", end: "#6D28D9" },
  { start: "#F97316", end: "#C2410C" },
  { start: "#EC4899", end: "#BE185D" },
  { start: "#22C55E", end: "#15803D" },
];

const avatarColor =
  colors[
    (settings?.businessName?.length || 0) %
    colors.length
  ];
  const { t } = useLanguage();
  
  return (
    <>
      {/* Chat Header */}

      <div className="chat-header">
        <div
  className="chat-avatar"
  style={{
    background: `linear-gradient(135deg, ${avatarColor.start}, ${avatarColor.end})`,
  }}
>
  {settings?.businessName
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()}
</div>

        <div>
          <h3>ApnaKhata</h3>
          <p>🟢 {t.online}</p>
        </div>
      </div>

      {/* Messages */}

      <div className="chat-body">

  <div className="welcome-card">

    <h2>
      {t.welcomeBack}, {settings?.ownerName} 👋
    </h2>

    <p>
      {t.readyToGenerate}
    </p>

  </div>

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
          placeholder={`${t.example}:

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
    📤 {t.generateInvoice}
</button>

      </div>
    </>
  );
}

export default Chat;