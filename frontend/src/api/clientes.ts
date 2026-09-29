import type { Cliente } from "../types";
import { http } from "./httpclient";

export function listarClientes() {
  return http.get<Cliente[]>("/api/clientes").then((r) => r.data);
}
