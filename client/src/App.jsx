import { Routes, Route } from "react-router-dom";
import BusinessSetup from "./pages/BusinessSetup";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; 
import LanguageSelection from "./pages/LanguageSelection";

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

  <Route
    path="/language"
    element={<LanguageSelection />}
/>

</Routes>
  );
}

export default App;