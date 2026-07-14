import { Routes, Route } from "react-router-dom";
import BusinessSetup from "./pages/BusinessSetup";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>

  <Route
    path="/"
    element={<Login />}
  />

  <Route
    path="/register"
    element={<Register />}
  />

  <Route
    path="/business-setup"
    element={<BusinessSetup />}
  />

  <Route
        path="/dashboard"
        element={<Dashboard />}
      />

</Routes>
  );
}

export default App;