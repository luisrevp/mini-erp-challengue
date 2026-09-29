import { create } from "zustand";
import { buscarArticulos } from "../api/articulos";
import type { Articulo } from "../types";
import { useUiStore } from "./uiStore";

type ArticuloState = {
  busqueda: string;
  cargando: boolean;
  articulos: Articulo[];
  setBusqueda: (busqueda: string) => void;
  buscar: (texto?: string) => Promise<void>;
};

export const useArticuloStore = create<ArticuloState>((set, get) => ({
  busqueda: "",
  cargando: false,
  articulos: [],

  setBusqueda: (busqueda) => set({ busqueda }),

  buscar: async (texto) => {
    set({ cargando: true });
    const q = texto ?? get().busqueda;
    try {
      const articulos = await buscarArticulos(q);
      set({ articulos, cargando: false });
    } catch (e) {
      useUiStore.getState().mostrar({ tipo: "error", texto: (e as Error).message });
      set({ cargando: false });
    }
  }
}));
