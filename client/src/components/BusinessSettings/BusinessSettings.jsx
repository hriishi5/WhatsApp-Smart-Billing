import { useState, useEffect } from "react";
import "./BusinessSettings.css";

function BusinessSettings({ onClose, onSave }) {
  const [settings, setSettings] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    upiNumber: "",
    upiId: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    onSave(settings);

    onClose();
  };

  return (
    <div className="settings-overlay">

      <div className="settings-box">

        <h2>Business Settings</h2>

        <input
          name="businessName"
          placeholder="Business Name"
          value={settings.businessName}
          onChange={handleChange}
        />

        <input
          name="ownerName"
          placeholder="Owner Name"
          value={settings.ownerName}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone"
          value={settings.phone}
          onChange={handleChange}
        />

        

        <input
          name="upiId"
          placeholder="UPI ID"
          value={settings.upiId}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          value={settings.email}
          onChange={handleChange}
        />

        <textarea
          name="address"
          placeholder="Address"
          value={settings.address}
          onChange={handleChange}
        />

        <div className="settings-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={handleSave}
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}

export default BusinessSettings;