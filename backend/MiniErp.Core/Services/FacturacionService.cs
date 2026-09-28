using Microsoft.EntityFrameworkCore;
using MiniErp.Core.Data;
using MiniErp.Core.Models;

namespace MiniErp.Core.Services;

public class FacturacionService
{
    private readonly AppDbContext _db;
    private readonly PresupuestoService _presupuestos;
    private readonly NumeracionService _numeracion;

    public FacturacionService(AppDbContext db, PresupuestoService presupuestos, NumeracionService numeracion)
    {
        _db = db;
        _presupuestos = presupuestos;
        _numeracion = numeracion;
    }

    public async Task<Factura> FacturarAsync(int presupuestoId)
    {
        // 1 sola query para obtener los articulos asociados

        var presupuesto = await _db.Presupuestos
            .Include(p => p.Items)
                .ThenInclude(i => i.Articulo)
            .FirstOrDefaultAsync(p => p.Id == presupuestoId)
            ?? throw new InvalidOperationException("El presupuesto no existe.");

        if (presupuesto.Estado.Equals(EstadoPresupuesto.Facturado))
        {
            throw new InvalidOperationException("El presupuesto ya esta facturado!");
        }

        var vencimiento = presupuesto.Fecha.AddDays(presupuesto.ValidezDias);
        if (DateTime.UtcNow > vencimiento)
            throw new InvalidOperationException("El presupuesto esta vencido y no se puede facturar.");

        foreach (var item in presupuesto.Items)
        {
            var articulo = item.Articulo;

            if (articulo is not null)
            {
                int nuevoValorStock = articulo.StockActual - item.Cantidad;
                articulo.StockActual = nuevoValorStock;
            }
        }

        var totales = _presupuestos.CalcularTotales(presupuesto);

        var factura = new Factura
        {
            Numero = await _numeracion.ProximoNumeroFacturaAsync(),
            Fecha = DateTime.UtcNow,
            PresupuestoId = presupuesto.Id,
            Subtotal = totales.Subtotal,
            Iva = totales.Iva,
            Total = totales.Total
        };

        presupuesto.Estado = EstadoPresupuesto.Facturado;
        _db.Facturas.Add(factura);
        await _db.SaveChangesAsync();
        return factura;
    }
}
