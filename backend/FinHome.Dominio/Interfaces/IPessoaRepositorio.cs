using FinHome.Dominio.Entidades;

namespace FinHome.Dominio.Interfaces;

public interface IPessoaRepositorio
{
    Task CriarAsync(Pessoa pessoa);
    Task<List<Pessoa>> ListarTodasAsync();
    Task<Pessoa?> ObterPorIdAsync(int id);
    Task AtualizarAsync(Pessoa pessoa);
    Task DeletarAsync(int id);
}