import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {

const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    }
  );

  const data = await response.json();

  if (data.success) {

  localStorage.setItem(
    "user",
    JSON.stringify(data.user)
  );

  localStorage.setItem(
    "token",
    data.token
  );

 
 if (data.hasBusiness) {
  navigate("/dashboard");
} else {
  navigate("/business-setup");
}



}    else {

  alert(data.message);

}
};


  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          💬
        </div>

        <h1>
          WhatsApp Smart Billing Assistant
        </h1>

        <p>
          Welcome back! Sign in to continue.
        </p>

        <form onSubmit={handleLogin}>

          <div className="input-group">

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="input-group">

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />

          </div>

          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>

        </form>

        <div className="login-footer">

          Don't have an account?

          <Link to="/register">
            Register
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;