import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./main.css";
import CssBaseline from "@mui/material/CssBaseline";
import { GlobalStyles } from "@mui/material";
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
    <BrowserRouter>
      <AuthProvider>
        <CssBaseline />
        <GlobalStyles styles={{ body: { backgroundColor: "#f4f6f8" } }} />
        <App />
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
