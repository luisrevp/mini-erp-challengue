import { create } from "zustand";
import { listarClientes } from "../api/clientes";
import type { Cliente } from "../types";
import { useUiStore } from "./uiStore";

type ClienteState = {
  clientes: Cliente[];
  cargando: boolean;
  cargar: () => Promise<void>;
};

export const useClienteStore = create<ClienteState>((set) => ({
  clientes: [],
  cargando: false,
  cargar: async () => {
    set({ cargando: true });
    try {
      const clientes = await listarClientes();
      set({ clientes, cargando: false });
    } catch (e) {
      set({ cargando: false });
      useUiStore.getState().mostrar({ tipo: "error", texto: (e as Error).message });
    }
  },
}));
