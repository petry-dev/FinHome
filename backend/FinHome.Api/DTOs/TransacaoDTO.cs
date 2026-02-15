using System.ComponentModel.DataAnnotations;
using FinHome.Dominio.Enums;
using FinHome.Dominio.Entidades;

namespace FinHome.Api.DTOs;

public record TransacaoRequest(
    [Required] string Descricao,
    [Range(0.01, 99999999)] decimal Valor,
    [Required] DateTime Data,
    [Required] TipoTransacao Tipo,
    [Required] int PessoaId,
    [Required] int CategoriaId
);

public record TransacaoResponse(
    int Id,
    string Descricao,
    decimal Valor,
    DateTime Data,
    TipoTransacao Tipo,
    int PessoaId,
    int CategoriaId,
    Pessoa? Pessoa,
    Categoria? Categoria
);
