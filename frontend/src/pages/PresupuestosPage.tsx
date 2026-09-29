import {
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useFacturacionStore } from "../stores/facturacionStore";
import { usePresupuestoStore } from "../stores/presupuestoStore";
import { formatFecha, formatMoney, vencido } from "../totales";

export default function PresupuestosPage() {
  const lista = usePresupuestoStore((s) => s.lista);
  const cargando = usePresupuestoStore((s) => s.cargando);
  const facturar = useFacturacionStore((s) => s.facturar);
  const facturandoId = useFacturacionStore((s) => s.facturandoId);

  if (cargando && lista.length === 0) {
    return (
      <Stack sx={{ alignItems: "center", py: 6 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Presupuestos</Typography>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>IVA</TableCell>
              <TableCell>Total</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {lista.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>Todavía no hay presupuestos.</TableCell>
              </TableRow>
            )}
            {lista.map((p) => {
              const yaFacturado = p.estado === "Facturado";
              const estaVencido = vencido(p.fecha, p.validezDias);
              return (
                <TableRow key={p.id}>
                  <TableCell>{p.numero}</TableCell>
                  <TableCell>{formatFecha(p.fecha)}</TableCell>
                  <TableCell>{p.clienteRazonSocial}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Chip size="small" label={p.estado} color={yaFacturado ? "primary" : "default"} />
                      {estaVencido && !yaFacturado && <Chip size="small" label="Vencido" color="warning" />}
                    </Stack>
                  </TableCell>
                  <TableCell>{formatMoney(p.subtotal)}</TableCell>
                  <TableCell>{formatMoney(p.iva)}</TableCell>
                  <TableCell>{formatMoney(p.total)}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={yaFacturado || facturandoId === p.id}
                      onClick={() => void facturar(p.id, p.numero)}
                    >
                      {facturandoId === p.id ? "Facturando…" : "Facturar"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
