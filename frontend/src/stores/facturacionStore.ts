import { create } from "zustand";
import { facturarPresupuesto } from "../api/facturas";
import { usePresupuestoStore } from "./presupuestoStore";
import { useUiStore } from "./uiStore";

type FacturacionState = {
  facturandoId: number | null;
  facturar: (presupuestoId: number, numero: number) => Promise<void>;
};

export const useFacturacionStore = create<FacturacionState>((set) => ({
  facturandoId: null,
  facturar: async (presupuestoId, numero) => {
    set({ facturandoId: presupuestoId });
    try {
      await facturarPresupuesto(presupuestoId);
      await usePresupuestoStore.getState().cargar();
      useUiStore.getState().mostrar({ tipo: "ok", texto: `Presupuesto N° ${numero} facturado.` });
    } catch (e) {
      useUiStore.getState().mostrar({ tipo: "error", texto: `Error de facturación: ${(e as Error).message}` });
    } finally {
      set({ facturandoId: null });
    }
  },
}));
