import { http } from "./httpclient";

export function facturarPresupuesto(presupuestoId: number) {
  return http.post(`/api/facturas/facturar/${presupuestoId}`).then((r) => r.data);
}
