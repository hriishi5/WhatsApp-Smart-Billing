import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessSettings.css";

function BusinessSettings({
  onClose,
  onSave,
  setupMode = false,
}) {
  const [settings, setSettings] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    upiNumber: "",
    upiId: "",  
    email: "",
    address: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {

  if (setupMode) return;

  fetch(`${import.meta.env.VITE_API_URL}/business`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
    .then((res) => res.json())
    .then((data) => {

      if (data) {
        setSettings(data);
      }

    })
    .catch((err) => console.log(err));

}, [setupMode]);

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {

 if (setupMode) {

  

  const response = await fetch(
  `${import.meta.env.VITE_API_URL}/business`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  }
);

  const data = await response.json();

  if (data.success) {

  alert("Business Profile Created!");

  navigate("/dashboard");

}

return;

}

  const response = await fetch(
  `${import.meta.env.VITE_API_URL}/business`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  }
);

const data = await response.json();

if (data.success) {

  onSave(settings);

  onClose();

}

};

  return (
    <div className="settings-overlay">

      <div className="settings-box">

       <h2>
  {setupMode ? "Business Setup" : "Business Settings"}
</h2>

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

          {!setupMode && (
  <button
    className="cancel-btn"
    onClick={onClose}
  >
    Cancel
  </button>
)}

          <button
            className="save-btn"
            onClick={handleSave}
          >
            {setupMode ? "Continue" : "Save Changes"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default BusinessSettings;