import {
  TextField,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead
} from "@mui/material";

import { useEffect } from "react";
import { useArticuloStore } from "../stores/articuloStore";
import { formatMoney } from "../totales";

export default function ArticulosPage() {
  const articulos = useArticuloStore((s) => s.articulos);
  const cargando = useArticuloStore((s) => s.cargando);
  const busqueda = useArticuloStore((s) => s.busqueda);
  const setBusqueda = useArticuloStore((s) => s.setBusqueda);
  const buscar = useArticuloStore((s) => s.buscar);

  useEffect(() => {
    const t = window.setTimeout(() => void buscar(busqueda), 200);
    return () => window.clearTimeout(t);
  }, [busqueda, buscar]);

  if (cargando && articulos.length === 0) {
    return (
      <Stack sx={{ alignItems: "center", py: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack>
      <Paper sx={{ p: 1 }}>
        <TextField
          fullWidth
          label="Buscar artículos"
          placeholder="Código o descripción (ej. teclado, ART-004)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </Paper>

      <Table size="medium" component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableHead>
          <TableRow>
            <TableCell>ID de producto</TableCell>
            <TableCell>Código</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Precio Unitario</TableCell>
            <TableCell>Stock Actual</TableCell>
            <TableCell>Alicuota IVA</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {articulos.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>Todavía no hay artículos.</TableCell>
            </TableRow>
          )}
          {articulos.map((a) => (
            <TableRow key={a.id} sx={{ backgroundColor: a.stockActual === 0 ? "rgba(255, 0, 0, 0.1)" : "inherit" }}>
              <TableCell>{a.id}</TableCell>
              <TableCell>{a.codigo}</TableCell>
              <TableCell>{a.descripcion}</TableCell>
              <TableCell>{formatMoney(a.precioUnitario)}</TableCell>
              <TableCell
                sx={{
                  color: a.stockActual === 0 ? "error.main" : "inherit",
                  fontWeight: a.stockActual === 0 ? "bold" : "normal"
                }}>
                {a.stockActual}
                {a.stockActual === 0 && " (sin stock)"}
              </TableCell>
              <TableCell>{a.alicuotaIva}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  )
}