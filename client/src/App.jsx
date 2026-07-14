import { Routes, Route } from "react-router-dom";
import BusinessSetup from "./pages/BusinessSetup";
import Login from "./pages/Login";
import Register from "./pages/Register";

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

</Routes>
  );
}

export default App;