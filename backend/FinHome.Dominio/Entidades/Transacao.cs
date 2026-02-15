using FinHome.Dominio.Enums;

namespace FinHome.Dominio.Entidades;

public class Transacao
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }
    public TipoTransacao Tipo { get; set; }

    public int PessoaId { get; set; }
    public Pessoa? Pessoa { get; set; }

    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }
}
