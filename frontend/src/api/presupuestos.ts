import type { CrearPresupuestoRequest, Presupuesto } from "../types";
import { http } from "./httpclient";

export function listarPresupuestos() {
  return http.get<Presupuesto[]>("/api/presupuestos").then((r) => r.data);
}

export function crearPresupuesto(body: CrearPresupuestoRequest) {
  return http.post<Presupuesto>("/api/presupuestos", body).then((r) => r.data);
}
