import type { Articulo } from "../types";
import { http } from "./httpclient";

export function buscarArticulos(busqueda?: string) {
  return http
    .get<Articulo[]>("/api/articulos", { params: busqueda?.trim() ? { busqueda: busqueda.trim() } : undefined })
    .then((r) => r.data);
}
