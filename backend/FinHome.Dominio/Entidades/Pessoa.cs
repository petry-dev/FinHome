using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FinHome.Dominio.Entidades;

public class Pessoa
{
    public int Id { get; set; }

    [MaxLength(200)] // Limite máximo de caracteres para o nome
    public string Nome { get; set; } = string.Empty;

    public int Idade { get; set; }

    [JsonIgnore] // Ignorado na serialização para evitar referência circular
    public List<Transacao> Transacoes { get; set; } = new();
}
