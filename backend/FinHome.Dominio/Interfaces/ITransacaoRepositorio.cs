using FinHome.Dominio.Entidades;

namespace FinHome.Dominio.Interfaces;

public interface ITransacaoRepositorio
{
    Task CriarAsync(Transacao transacao);
    Task<List<Transacao>> ListarTodasAsync();
    Task<Transacao?> ObterPorIdAsync(int id);
    Task AtualizarAsync(Transacao transacao);
    Task DeletarAsync(int id);
}