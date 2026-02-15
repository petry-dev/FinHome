using FinHome.Dominio.Enums;
using FinHome.Infra.Contexto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Api.Controllers;

[ApiController]
[Route("relatorios")]
public class RelatoriosController : ControllerBase
{
    private readonly AppDbContext _db;

    public RelatoriosController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("por-pessoa")]
    public async Task<IActionResult> TotaisPorPessoa()
    {
        var pessoas = await _db.Pessoas
            .Include(p => p.Transacoes)
            .ToListAsync();

        var relatorio = pessoas.Select(p => new
        {
            p.Nome,
            TotalReceitas = p.Transacoes.Where(t => t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor),
            TotalDespesas = p.Transacoes.Where(t => t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor),
            Saldo = p.Transacoes.Where(t => t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor) -
                    p.Transacoes.Where(t => t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor)
        }).ToList();

        var totalGeral = new
        {
            Nome = "TOTAL GERAL",
            TotalReceitas = relatorio.Sum(r => r.TotalReceitas),
            TotalDespesas = relatorio.Sum(r => r.TotalDespesas),
            Saldo = relatorio.Sum(r => r.Saldo)
        };

        return Ok(new { Detalhado = relatorio, Totalizacao = totalGeral });
    }
}
