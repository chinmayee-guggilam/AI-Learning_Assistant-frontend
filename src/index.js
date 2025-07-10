import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { DarkModeProvider } from "./components/DarkModeContext"; // Adjust path

ReactDOM.createRoot(document.getElementById("root")).render(<DarkModeProvider>
    <App />
  </DarkModeProvider>
);
