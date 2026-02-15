using FinHome.Dominio.Entidades;
using FinHome.Infra.Contexto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Api.Controllers;

[ApiController]
[Route("pessoas")]
public class PessoasController : ControllerBase
{
    private readonly AppDbContext _db;

    public PessoasController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<Pessoa>>> Listar()
    {
        return await _db.Pessoas.ToListAsync();
    }

    [HttpPost]
    public async Task<IActionResult> Criar(Pessoa pessoa)
    {
        if (pessoa.Nome.Length > 200) return BadRequest("Nome muito longo.");

        _db.Pessoas.Add(pessoa);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Listar), new { id = pessoa.Id }, pessoa);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, Pessoa pessoaAtualizada)
    {
        var pessoa = await _db.Pessoas.FindAsync(id);
        if (pessoa == null) return NotFound();

        pessoa.Nome = pessoaAtualizada.Nome;
        pessoa.Idade = pessoaAtualizada.Idade;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var pessoa = await _db.Pessoas.FindAsync(id);
        if (pessoa == null) return NotFound();

        // As transações vinculadas são removidas automaticamente via cascade delete configurado no contexto
        _db.Pessoas.Remove(pessoa);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
