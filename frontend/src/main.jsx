import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { initSuperTokens } from "./config/supertokens";
import "./styles/index.css";

// Initialize SuperTokens before rendering
initSuperTokens();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
