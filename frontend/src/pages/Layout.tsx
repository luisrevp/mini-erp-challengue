import { AppBar, Box, Button, Container, Snackbar, Alert, Toolbar, Typography } from "@mui/material";
import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useArticuloStore } from "../stores/articuloStore";
import { useClienteStore } from "../stores/clienteStore";
import { usePresupuestoStore } from "../stores/presupuestoStore";
import { useUiStore } from "../stores/uiStore";

export default function Layout() {
  const aviso = useUiStore((s) => s.aviso);
  const limpiar = useUiStore((s) => s.limpiar);

  useEffect(() => {
    void (async () => {
      await useClienteStore.getState().cargar();
      await usePresupuestoStore.getState().cargar();
      await useArticuloStore.getState().buscar("");
    })();
  }, []);

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Mini ERP
          </Typography>
          <Button color="inherit" component={NavLink} to="/" end sx={{ "&.active": { textDecoration: "underline" } }}>
            Presupuestos
          </Button>
          <Button color="inherit" component={NavLink} to="/nuevo" sx={{ "&.active": { textDecoration: "underline" } }}>
            Nuevo
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
      <Snackbar open={!!aviso} autoHideDuration={5000} onClose={limpiar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        {aviso ? (
          <Alert onClose={limpiar} severity={aviso.tipo === "ok" ? "success" : "error"} variant="filled">
            {aviso.texto}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
