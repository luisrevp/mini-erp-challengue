import { create } from "zustand";
import { crearPresupuesto, listarPresupuestos } from "../api/presupuestos";
import { formatMoney } from "../totales";
import type { Articulo, LineaEditor, Presupuesto } from "../types";
import { useClienteStore } from "./clienteStore";
import { useUiStore } from "./uiStore";

function nextKey() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type PresupuestoState = {
  lista: Presupuesto[];
  cargando: boolean;
  guardando: boolean;
  clienteId: number | "";
  validezDias: number;
  lineas: LineaEditor[];
  cargar: () => Promise<void>;
  setClienteId: (id: number | "") => void;
  setValidezDias: (dias: number) => void;
  agregarArticulo: (articulo: Articulo) => void;
  actualizarLinea: (key: string, patch: Partial<Pick<LineaEditor, "cantidad" | "descuentoPct">>) => void;
  quitarLinea: (key: string) => void;
  resetBorrador: () => void;
  crear: () => Promise<boolean>;
};

export const usePresupuestoStore = create<PresupuestoState>((set, get) => ({
  lista: [],
  cargando: false,
  guardando: false,
  clienteId: "",
  validezDias: 15,
  lineas: [],

  cargar: async () => {
    set({ cargando: true });
    try {
      const lista = await listarPresupuestos();
      const { clienteId } = get();
      const clientes = useClienteStore.getState().clientes;
      const primerCliente =
        clienteId === "" && clientes[0] ? clientes[0].id : clienteId;
      set({ lista, cargando: false, clienteId: primerCliente });
    } catch (e) {
      set({ cargando: false });
      useUiStore.getState().mostrar({ tipo: "error", texto: (e as Error).message });
    }
  },

  setClienteId: (clienteId) => set({ clienteId }),
  setValidezDias: (validezDias) => set({ validezDias }),

  agregarArticulo: (articulo) => {
    const { lineas } = get();
    const existente = lineas.find((l) => l.articulo.id === articulo.id);
    if (existente) {
      set({
        lineas: lineas.map((l) =>
          l.articulo.id === articulo.id ? { ...l, cantidad: l.cantidad + 1 } : l,
        ),
      });
      return;
    }
    set({ lineas: [...lineas, { key: nextKey(), articulo, cantidad: 1, descuentoPct: 0 }] });
  },

  actualizarLinea: (key, patch) => {
    set({
      lineas: get().lineas.map((l) => (l.key === key ? { ...l, ...patch } : l)),
    });
  },

  quitarLinea: (key) => set({ lineas: get().lineas.filter((l) => l.key !== key) }),

  resetBorrador: () => set({ lineas: [], validezDias: 15 }),

  crear: async () => {
    const { clienteId, validezDias, lineas } = get();
    const mostrar = useUiStore.getState().mostrar;

    if (clienteId === "") {
      mostrar({ tipo: "error", texto: "Elegí un cliente." });
      return false;
    }
    if (!lineas.length) {
      mostrar({ tipo: "error", texto: "Agregá al menos un artículo." });
      return false;
    }
    if (lineas.some((l) => l.cantidad <= 0)) {
      mostrar({ tipo: "error", texto: "La cantidad no puede ser 0 o negativa." });
      return false;
    }
    if (lineas.some((l) => l.descuentoPct < 0 || l.descuentoPct > 100)) {
      mostrar({ tipo: "error", texto: "El descuento debe estar entre 0% y 100%." });
      return false;
    }

    set({ guardando: true });
    try {
      const creado = await crearPresupuesto({
        clienteId,
        validezDias,
        items: lineas.map((l) => ({
          articuloId: l.articulo.id,
          cantidad: l.cantidad,
          descuentoPct: l.descuentoPct,
        })),
      });
      get().resetBorrador();
      await get().cargar();
      mostrar({
        tipo: "ok",
        texto: `Presupuesto N° ${creado.numero} creado. Total ${formatMoney(creado.total)}.`,
      });
      set({ guardando: false });
      return true;
    } catch (e) {
      set({ guardando: false });
      mostrar({ tipo: "error", texto: (e as Error).message });
      return false;
    }
  },
}));
