namespace FinHome.Api.DTOs;

public record PessoaRequest(string Nome, int Idade);

public record PessoaResponse(int Id, string Nome, int Idade);
