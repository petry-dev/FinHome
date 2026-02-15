using FinHome.Dominio.Entidades;
using FinHome.Dominio.Interfaces;
using FinHome.Infra.Contexto;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Infra.Repositorios;

public class TransacaoRepositorio : ITransacaoRepositorio
{
    private readonly AppDbContext _context;

    public TransacaoRepositorio(AppDbContext context)
    {
        _context = context;
    }

    public async Task CriarAsync(Transacao transacao)
    {
        _context.Transacoes.Add(transacao);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Transacao>> ListarTodasAsync()
    {
        return await _context.Transacoes
            .Include(t => t.Pessoa)
            .Include(t => t.Categoria)
            .OrderByDescending(t => t.Data)
            .ToListAsync();
    }

    public async Task<Transacao?> ObterPorIdAsync(int id)
    {
        return await _context.Transacoes
            .Include(t => t.Pessoa)
            .Include(t => t.Categoria)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task DeletarAsync(int id)
    {
        var transacao = await _context.Transacoes.FindAsync(id);
        if (transacao != null)
        {
            _context.Transacoes.Remove(transacao);
            await _context.SaveChangesAsync();
        }
    }

    public async Task AtualizarAsync(Transacao transacao)
    {
        _context.Transacoes.Update(transacao);
        await _context.SaveChangesAsync();
    }
}
