# NOTES

> Completá este archivo a medida que avanzás. Es parte de la entrega.

## Bugs encontrados (backend)

1. **IVA con alícuota fija del 21%**
   - **Qué pasaba:** `CalcularTotales` aplicaba `subtotal * 0.21` sobre el presupuesto entero.
   - **Por qué:** no respetaba la alícuota de cada artículo (21% o 10,5%) ni el cálculo por línea.
   - **Cómo se resolvió:** el IVA se calcula por línea (`subtotalLinea × alícuota / 100`), **redondeando a 2 decimales por línea** (`MidpointRounding.AwayFromZero`) y recién después se suma. El descuento sigue aplicándose antes del IVA.

2. **Listado que ocultaba los presupuestos recién creados**
   - **Qué pasaba:** `POST /api/presupuestos` deja el estado en `Borrador`, pero `ListarAsync` filtraba `Estado != Borrador`. Después de crear, `GET /api/presupuestos` no devolvía el documento.
   - **Por qué:** el listado asumía que los borradores no debían verse, en contra del flujo de crear y listar.
   - **Cómo se resolvió:** el listado de la API pide todos los estados (`ListarAsync(false)`). El filtro de borradores quedó opcional en el servicio.

3. **Facturación con stock insuficiente dejaba stock negativo**
   - **Qué pasaba:** `StockActual -= cantidad` sin chequear disponibilidad.
   - **Por qué:** no había invariante de stock en el dominio ni validación previa al descuento.
   - **Cómo se resolvió:** el setter de `Articulo.StockActual` rechaza valores negativos. Al facturar, si no hay stock, se lanza `InvalidOperationException` y no se persiste el cambio.

4. **Un presupuesto se podía facturar más de una vez**
   - **Qué pasaba:** no se validaba el estado antes de descontar stock y generar factura.
   - **Por qué:** faltaba la regla de idempotencia.
   - **Cómo se resolvió:** si el estado ya es `Facturado`, se lanza excepción y no se vuelve a descontar stock.

5. **Cantidades y descuentos inválidos se aceptaban**
   - **Qué pasaba:** `Cantidad` y `DescuentoPct` eran propiedades anémicas; `cantidad: 0` o descuentos fuera de rango pasaban.
   - **Por qué:** no había validación en el modelo ni mapeo a 400 en el create.
   - **Cómo se resolvió:** invariantes en `PresupuestoItem` (cantidad > 0, descuento entre 0 y 100). El controller captura `ArgumentException` y responde `400` con el mensaje.

6. **N+1 al facturar y tracking innecesario en lecturas**
   - **Qué pasaba:** por cada ítem se iba a buscar el artículo; las consultas de listado trackeaban entidades sin necesidad.
   - **Por qué:** no era un bug de negocio, pero pegaba en consistencia y en round-trips.
   - **Cómo se resolvió:** eager load de ítems + artículo al facturar; `AsNoTracking` en listados de consulta.

## Decisiones del cliente React

- Carpeta `frontend/`, Vite + React 18 + TypeScript. Sin router, sin store, sin UI kit: tres módulos (`api.ts`, `totales.ts`, `App.tsx`) porque el challenge pide un cliente mínimo.
- Consume `http://localhost:5080` (CORS ya habilitado para el puerto 5173 de Vite).
- **Totales en vivo:** misma regla que el backend — subtotal de línea = `cantidad × precio × (1 − desc%)`; IVA de línea = redondeo a 2 decimales de `subtotal × alícuota / 100`; después se suman. Ejemplo seed ART-001 + ART-004: subtotal 39.500, IVA 7.822,50, total 47.322,50.
- La grilla lista presupuestos y factura desde ahí. El error de la API (`sin stock`, `vencido`, `ya facturado`) se muestra en un banner. El botón se deshabilita si ya está facturado; el vencimiento se advierte en la fila, pero igual se intenta facturar para que el backend sea la fuente de verdad.

## Qué hice y qué dejé afuera

- Prioricé: bugs de negocio del backend, tests en verde, y el cliente must-have (lista, alta con totales en vivo, facturar con error).
- Dejé afuera el stretch: duplicar presupuesto, reporte top N, tests del cliente. No eran bloqueantes para la entrega mínima.

## Cómo usé IA

- Pedí ayuda para armar el cliente React (estructura plana, totales alineados al backend) y para redactar este `NOTES.md` a partir del historial de commits.
- Acepté el esqueleto Vite + el cálculo de totales replicado en el front.
- No delegué el criterio de los bugs: los cambios de dominio (IVA, stock, idempotencia, listado, invariantes) ya estaban en los commits previos.
- Cuidado con el IVA: el primer arreglo usaba la alícuota por línea pero **sin** redondear a 2 decimales; eso se corrigió para que front y back coincidan con la consigna.

## Qué haría con más tiempo / qué falta para producción

- Validación de vencido y de cliente inexistente más clara en create.
- Autenticación, autorización y auditoría de facturación. Se sumaría un sistema de usuarios
- Backend más sólido. Usaría diseño orientado al dominio para tener modelos que protejan sus propias reglas de negocio con invariantes
- Stretch: duplicar con precios refrescados y reporte de artículos facturados.
