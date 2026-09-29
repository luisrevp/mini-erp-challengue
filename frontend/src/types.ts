export type Cliente = {
  id: number;
  razonSocial: string;
  cuit: string;
  condicionIva: string;
};

export type Articulo = {
  id: number;
  codigo: string;
  descripcion: string;
  precioUnitario: number;
  stockActual: number;
  alicuotaIva: number;
};

export type PresupuestoItem = {
  articuloId: number;
  articuloCodigo: string;
  articuloDescripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPct: number;
  alicuotaIva: number;
  subtotalLinea: number;
};

export type Presupuesto = {
  id: number;
  numero: number;
  fecha: string;
  clienteId: number;
  clienteRazonSocial: string;
  estado: string;
  validezDias: number;
  items: PresupuestoItem[];
  subtotal: number;
  iva: number;
  total: number;
};

export type LineaEditor = {
  key: string;
  articulo: Articulo;
  cantidad: number;
  descuentoPct: number;
};

export type CrearPresupuestoRequest = {
  clienteId: number;
  validezDias: number;
  items: { articuloId: number; cantidad: number; descuentoPct: number }[];
};

export type Aviso = {
  tipo: "ok" | "error";
  texto: string;
};
