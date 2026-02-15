using FinHome.Dominio.Entidades;

namespace FinHome.Dominio.Interfaces;

public interface ICategoriaRepositorio
{
    Task CriarAsync(Categoria categoria);
    Task<List<Categoria>> ListarTodasAsync();
    Task<Categoria?> ObterPorIdAsync(int id);
    Task AtualizarAsync(Categoria categoria);
    Task DeletarAsync(int id);
}