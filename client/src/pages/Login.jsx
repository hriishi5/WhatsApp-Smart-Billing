import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
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

  const handleLogin = (e) => {
    e.preventDefault();

    console.log(form);

    // API will come here later
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