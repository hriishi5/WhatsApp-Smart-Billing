import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "./LanguageSelection.css";

function LanguageSelection() {

  const navigate = useNavigate();

  const { setLanguage } = useLanguage();

  const token = localStorage.getItem("token");

const chooseLanguage = async (lang) => {

  try {

    await fetch(
      `${import.meta.env.VITE_API_URL}/language`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          language: lang,
        }),
      }
    );

    setLanguage(lang);

    navigate("/business-setup");

  } catch (err) {

    console.log(err);

  }

};

  return (

    <div className="language-page">

      <div className="language-card">

        <div className="language-icon">
          🌐
        </div>

        <h1>
          Choose Your Language
        </h1>

        <p>
          Select your preferred language to continue.
        </p>

        <button
          className="language-btn"
          onClick={() => chooseLanguage("en")}
        >
          English
        </button>

        <button
          className="language-btn"
          onClick={() => chooseLanguage("kn")}
        >
          ಕನ್ನಡ
        </button>

      </div>

    </div>

  );

}

export default LanguageSelection;