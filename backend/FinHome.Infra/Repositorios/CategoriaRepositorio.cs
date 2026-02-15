using FinHome.Dominio.Entidades;
using FinHome.Dominio.Interfaces;
using FinHome.Infra.Contexto;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Infra.Repositorios;

public class CategoriaRepositorio : ICategoriaRepositorio
{
    private readonly AppDbContext _contexto;

    public CategoriaRepositorio(AppDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task CriarAsync(Categoria categoria)
    {
        _contexto.Categorias.Add(categoria);
        await _contexto.SaveChangesAsync();
    }

    public async Task<List<Categoria>> ListarTodasAsync()
    {
        return await _contexto.Categorias.ToListAsync();
    }

    public async Task<Categoria?> ObterPorIdAsync(int id)
    {
        return await _contexto.Categorias.FindAsync(id);
    }

    public async Task AtualizarAsync(Categoria categoria)
    {
        _contexto.Categorias.Update(categoria);
        await _contexto.SaveChangesAsync();
    }

    public async Task DeletarAsync(int id)
    {
        var categoria = await ObterPorIdAsync(id);
        if (categoria != null)
        {
            _contexto.Categorias.Remove(categoria);
            await _contexto.SaveChangesAsync();
        }
    }
}