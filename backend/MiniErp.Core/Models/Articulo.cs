namespace MiniErp.Core.Models;

public class Articulo
{
    private int stockActual;
    public int Id { get; set; }
    public string Codigo { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public decimal PrecioUnitario { get; set; }
    public int StockActual 
    {
        // Source of truth: un articulo no debe tener valor negativo
        // El Articulo protege sus propias invariantes, en caso de validaciones faltantes fuera del modelo 

        get => stockActual;
        set
        {
            if (value < 0)
            {
                throw new InvalidOperationException($"El stock para el articulo {Descripcion} no puede ser negativo!");
            }

            stockActual = value;
        }
    }

    /// <summary>Alícuota de IVA del artículo (por ejemplo 21 o 10.5).</summary>
    public decimal AlicuotaIva { get; set; }
}
