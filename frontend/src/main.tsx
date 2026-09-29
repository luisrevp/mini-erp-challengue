import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./pages/Layout";
import NuevoPresupuestoPage from "./pages/NuevoPresupuestoPage";
import PresupuestosPage from "./pages/PresupuestosPage";
import ArticulosPage from "./pages/Articulos";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1565c0" },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<PresupuestosPage />} />
            <Route path="nuevo" element={<NuevoPresupuestoPage />} />
            <Route path="articulos" element={<ArticulosPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
