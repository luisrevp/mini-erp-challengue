/** Misma regla que el backend: redondeo a 2 decimales AwayFromZero por línea de IVA. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function subtotalLinea(cantidad: number, precioUnitario: number, descuentoPct: number): number {
  return cantidad * precioUnitario * (1 - descuentoPct / 100);
}

export function ivaLinea(subtotal: number, alicuotaIva: number): number {
  return round2(subtotal * (alicuotaIva / 100));
}

export function calcularTotales(
  lineas: { cantidad: number; precioUnitario: number; descuentoPct: number; alicuotaIva: number }[],
) {
  let subtotal = 0;
  let iva = 0;
  for (const linea of lineas) {
    const sub = subtotalLinea(linea.cantidad, linea.precioUnitario, linea.descuentoPct);
    subtotal += sub;
    iva += ivaLinea(sub, linea.alicuotaIva);
  }
  return { subtotal, iva, total: subtotal + iva };
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-AR");
}

export function vencido(fechaIso: string, validezDias: number): boolean {
  const vencimiento = new Date(fechaIso);
  vencimiento.setDate(vencimiento.getDate() + validezDias);
  return Date.now() > vencimiento.getTime();
}
