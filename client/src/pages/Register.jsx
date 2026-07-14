import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
  e.preventDefault();

  try {

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const data = await response.json();

    if (response.ok) {

      alert("Registration Successful!");

      window.location.href = "/";

    } else {

      alert(data.message);

    }

  } catch (err) {

    console.log(err);

    alert("Something went wrong.");

  }
};

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">💬</div>

        <h1>Create Account</h1>

        <p>Start using WhatsApp Smart Billing Assistant.</p>

        <form onSubmit={handleRegister}>

          <div className="input-group">
            <label>Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

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
            Register
          </button>

        </form>

        <div className="login-footer">
          Already have an account?
          <Link to="/"> Login</Link>
        </div>

      </div>
    </div>
  );
}

export default Register;