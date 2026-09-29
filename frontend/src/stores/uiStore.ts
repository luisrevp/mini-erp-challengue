import { create } from "zustand";
import type { Aviso } from "../types";

type UiState = {
  aviso: Aviso | null;
  mostrar: (aviso: Aviso) => void;
  limpiar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  aviso: null,
  mostrar: (aviso) => set({ aviso }),
  limpiar: () => set({ aviso: null }),
}));
