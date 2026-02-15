using System.ComponentModel.DataAnnotations;
using FinHome.Dominio.Enums;

namespace FinHome.Dominio.Entidades;

public class Categoria
{
    public int Id { get; set; }

    [MaxLength(400)] // Limite máximo de caracteres para o nome
    public string Nome { get; set; } = string.Empty;

    public TipoFinalidade Finalidade { get; set; }
}
