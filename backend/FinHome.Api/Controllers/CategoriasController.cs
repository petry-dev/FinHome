using FinHome.Dominio.Entidades;
using FinHome.Infra.Contexto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Api.Controllers;

[ApiController]
[Route("categorias")]
public class CategoriasController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriasController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<Categoria>>> Listar()
    {
        return await _db.Categorias.ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> Criar(Categoria categoria)
    {
        if (categoria.Nome.Length > 400) return BadRequest("Descrição muito longa.");

        _db.Categorias.Add(categoria);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Listar), new { id = categoria.Id }, categoria);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, Categoria catAtualizada)
    {
        var cat = await _db.Categorias.FindAsync(id);
        if (cat == null) return NotFound();
        cat.Nome = catAtualizada.Nome;
        cat.Finalidade = catAtualizada.Finalidade;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var cat = await _db.Categorias.FindAsync(id);
        if (cat == null) return NotFound();
        _db.Categorias.Remove(cat);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
