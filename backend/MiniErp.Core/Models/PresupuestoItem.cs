namespace MiniErp.Core.Models;

public class PresupuestoItem
{
    private int cantidad;
    private decimal descuentoPct;
    private readonly decimal limiteMaximoPct = 100m;
    public int Id { get; set; }

    public int PresupuestoId { get; set; }
    public Presupuesto? Presupuesto { get; set; }

    public int ArticuloId { get; set; }
    public Articulo? Articulo { get; set; }

    public int Cantidad 
    {
        get => cantidad;
        set
        {
            if (value <= 0)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(value),
                    "La cantidad no puede ser 0 o negativa"
                );
            }

            cantidad = value;
        } 
    }

    public decimal DescuentoPct
    {
        get => descuentoPct;
        set
        {
            if (value < 0m || value > limiteMaximoPct)
            {
                // al ser negativo = no descuenta (por el contratio, actua como recargo)
                throw new ArgumentOutOfRangeException(
                    nameof(value),
                    $"El descuento debe estar entre 0% y {limiteMaximoPct}%"
                );
            }

            descuentoPct = value;
        }
    }

    public decimal PrecioUnitario { get; set; }

    /// <summary>Snapshot de la alícuota del artículo al armar el presupuesto.</summary>
    public decimal AlicuotaIva { get; set; }
}
