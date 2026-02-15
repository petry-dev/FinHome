using FinHome.Dominio.Entidades;
using FinHome.Dominio.Interfaces;
using FinHome.Infra.Contexto;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Infra.Repositorios;

public class PessoaRepositorio : IPessoaRepositorio
{
    private readonly AppDbContext _contexto;

    public PessoaRepositorio(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task CriarAsync(Pessoa pessoa)
    {
        _contexto.Pessoas.Add(pessoa);
        await _contexto.SaveChangesAsync();
    }

    public async Task<List<Pessoa>> ListarTodasAsync()
    {
        return await _contexto.Pessoas.ToListAsync();
    }

    public async Task<Pessoa?> ObterPorIdAsync(int id)
    {
        return await _contexto.Pessoas.FindAsync(id);
    }

    public async Task AtualizarAsync(Pessoa pessoa)
    {
        _contexto.Pessoas.Update(pessoa);
        await _contexto.SaveChangesAsync();
    }

    public async Task DeletarAsync(int id)
    {
        var pessoa = await ObterPorIdAsync(id);
        if (pessoa != null)
        {
            _contexto.Pessoas.Remove(pessoa);
            await _contexto.SaveChangesAsync();
        }
    }
}
