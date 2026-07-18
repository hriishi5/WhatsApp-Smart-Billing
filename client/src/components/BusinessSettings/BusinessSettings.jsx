import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./BusinessSettings.css";
import { useLanguage } from "../../context/LanguageContext";

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
  const { language, setLanguage, t } = useLanguage(); 
  console.log("Language:", language);
console.log("Save Changes:", t.saveChanges);
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

  alert(t.businessProfileCreated);

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
  {setupMode ? t.businessSetup : t.businessSettings}
</h2>

        <input
          name="businessName"
          placeholder={t.businessName}
          value={settings.businessName}
          onChange={handleChange}
        />

        <input
          name="ownerName"
          placeholder={t.ownerName}
          value={settings.ownerName}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder={t.phone}
          value={settings.phone}
          onChange={handleChange}
        />

        

        <input
          name="upiId"
          placeholder={t.upiId}
          value={settings.upiId}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder={t.email}
          value={settings.email}
          onChange={handleChange}
        />

        <textarea
          name="address"
          placeholder={t.address}
          value={settings.address}
          onChange={handleChange}
        /> 

        <div className="language-setting">
  <label>{t.language}</label>

  <select
    value={language}
    onChange={(e) => setLanguage(e.target.value)}
  >
    <option value="en">{t.english}</option>
    <option value="kn">{t.kannada}</option>
  </select>
</div>

        <div className="settings-buttons">

          {!setupMode && (
  <button
    className="cancel-btn"
    onClick={onClose}
  >
    {t.cancel}
  </button>
)}

          <button
            className="save-btn"
            onClick={handleSave}
          >
            {setupMode ? t.continue : t.saveChanges}
          </button>

        </div>

      </div>

    </div>
  );
}

export default BusinessSettings;