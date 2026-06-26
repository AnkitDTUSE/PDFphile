import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";

axios.defaults.baseURL = "https://pdfphile-obxl.onrender.com";
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(<App />);
