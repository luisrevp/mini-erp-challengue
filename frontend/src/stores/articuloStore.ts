import { create } from "zustand";
import { buscarArticulos } from "../api/articulos";
import type { Articulo } from "../types";
import { useUiStore } from "./uiStore";

type ArticuloState = {
  busqueda: string;
  articulos: Articulo[];
  setBusqueda: (busqueda: string) => void;
  buscar: (texto?: string) => Promise<void>;
};

export const useArticuloStore = create<ArticuloState>((set, get) => ({
  busqueda: "",
  articulos: [],
  setBusqueda: (busqueda) => set({ busqueda }),
  buscar: async (texto) => {
    const q = texto ?? get().busqueda;
    try {
      const articulos = await buscarArticulos(q);
      set({ articulos });
    } catch (e) {
      useUiStore.getState().mostrar({ tipo: "error", texto: (e as Error).message });
    }
  },
}));
