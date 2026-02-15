using FinHome.Dominio.Enums;

namespace FinHome.Api.DTOs;

public record CategoriaRequest(string Nome, TipoFinalidade Finalidade);
public record CategoriaResponse(int Id, string Nome, TipoFinalidade Finalidade);
