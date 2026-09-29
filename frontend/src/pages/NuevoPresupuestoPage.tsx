import {
  Button,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useArticuloStore } from "../stores/articuloStore";
import { useClienteStore } from "../stores/clienteStore";
import { usePresupuestoStore } from "../stores/presupuestoStore";
import { calcularTotales, formatMoney, ivaLinea, subtotalLinea } from "../totales";

export default function NuevoPresupuestoPage() {
  const navigate = useNavigate();

  const clientes = useClienteStore((s) => s.clientes);

  const articulos = useArticuloStore((s) => s.articulos);
  const busqueda = useArticuloStore((s) => s.busqueda);
  const setBusqueda = useArticuloStore((s) => s.setBusqueda);
  const buscar = useArticuloStore((s) => s.buscar);

  const clienteId = usePresupuestoStore((s) => s.clienteId);
  const validezDias = usePresupuestoStore((s) => s.validezDias);
  const lineas = usePresupuestoStore((s) => s.lineas);
  const guardando = usePresupuestoStore((s) => s.guardando);
  const setClienteId = usePresupuestoStore((s) => s.setClienteId);
  const setValidezDias = usePresupuestoStore((s) => s.setValidezDias);
  const agregarArticulo = usePresupuestoStore((s) => s.agregarArticulo);
  const actualizarLinea = usePresupuestoStore((s) => s.actualizarLinea);
  const quitarLinea = usePresupuestoStore((s) => s.quitarLinea);
  const resetBorrador = usePresupuestoStore((s) => s.resetBorrador);
  const crear = usePresupuestoStore((s) => s.crear);

  useEffect(() => {
    if (clienteId === "" && clientes.length) setClienteId(clientes[0].id);
  }, [clientes, clienteId, setClienteId]);

  useEffect(() => {
    const t = window.setTimeout(() => void buscar(busqueda), 200);
    return () => window.clearTimeout(t);
  }, [busqueda, buscar]);

  const totales = useMemo(
    () =>
      calcularTotales(
        lineas.map((l) => ({
          cantidad: l.cantidad,
          precioUnitario: l.articulo.precioUnitario,
          descuentoPct: l.descuentoPct,
          alicuotaIva: l.articulo.alicuotaIva,
        })),
      ),
    [lineas],
  );

  async function onCrear(e: FormEvent) {
    e.preventDefault();
    const ok = await crear();
    if (ok) navigate("/");
  }

  function onCancelar() {
    resetBorrador();
    navigate("/");
  }

  return (
    <Stack component="form" spacing={2} onSubmit={onCrear}>
      <Typography variant="h5">Nuevo presupuesto</Typography>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            select
            fullWidth
            label="Cliente"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value === "" ? "" : Number(e.target.value))}
          >
            {clientes.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.razonSocial}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="number"
            label="Validez (días)"
            value={validezDias}
            onChange={(e) => setValidezDias(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{ minWidth: 180 }}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Buscar artículos"
          placeholder="Código o descripción (ej. teclado, ART-004)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <List dense sx={{ maxHeight: 240, overflow: "auto", mt: 1 }}>
          {articulos.map((a) => (
            <ListItemButton key={a.id} onClick={() => agregarArticulo(a)}>
              <ListItemText
                primary={`${a.codigo} — ${a.descripcion}`}
                secondary={`${formatMoney(a.precioUnitario)} · IVA ${a.alicuotaIva}% · stock ${a.stockActual}`}
              />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Artículo</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Desc. %</TableCell>
              <TableCell>IVA</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>IVA línea</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {lineas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>Buscá y hacé click en un artículo para agregarlo.</TableCell>
              </TableRow>
            )}
            {lineas.map((l) => {
              const sub = subtotalLinea(l.cantidad, l.articulo.precioUnitario, l.descuentoPct);
              return (
                <TableRow key={l.key}>
                  <TableCell>
                    {l.articulo.codigo} — {l.articulo.descripcion}
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {formatMoney(l.articulo.precioUnitario)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={l.cantidad}
                      onChange={(e) => actualizarLinea(l.key, { cantidad: Number(e.target.value) })}
                      slotProps={{ htmlInput: { min: 1 } }}
                      sx={{ width: 90 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={l.descuentoPct}
                      onChange={(e) => actualizarLinea(l.key, { descuentoPct: Number(e.target.value) })}
                      slotProps={{ htmlInput: { min: 0, max: 100, step: 0.5 } }}
                      sx={{ width: 90 }}
                    />
                  </TableCell>
                  <TableCell>{l.articulo.alicuotaIva}%</TableCell>
                  <TableCell>{formatMoney(sub)}</TableCell>
                  <TableCell>{formatMoney(ivaLinea(sub, l.articulo.alicuotaIva))}</TableCell>
                  <TableCell>
                    <Button size="small" color="error" onClick={() => quitarLinea(l.key)}>
                      Quitar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Stack direction="row" spacing={4} sx={{ justifyContent: "flex-end" }}>
        <Stack sx={{ alignItems: "flex-end" }}>
          <Typography variant="caption" color="text.secondary">
            Subtotal
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>{formatMoney(totales.subtotal)}</Typography>
        </Stack>
        <Stack sx={{ alignItems: "flex-end" }}>
          <Typography variant="caption" color="text.secondary">
            IVA
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>{formatMoney(totales.iva)}</Typography>
        </Stack>
        <Stack sx={{ alignItems: "flex-end" }}>
          <Typography variant="caption" color="text.secondary">
            Total
          </Typography>
          <Typography sx={{ fontWeight: 600 }}>{formatMoney(totales.total)}</Typography>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
        <Button onClick={onCancelar} disabled={guardando}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={guardando}>
          {guardando ? "Guardando…" : "Crear presupuesto"}
        </Button>
      </Stack>
    </Stack>
  );
}
