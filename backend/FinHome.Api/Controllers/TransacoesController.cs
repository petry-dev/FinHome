using FinHome.Api.DTOs;
using FinHome.Dominio.Entidades;
using FinHome.Dominio.Enums;
using FinHome.Dominio.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FinHome.Api.Controllers;

[ApiController]
[Route("transacoes")]
public class TransacoesController : ControllerBase
{
    private readonly ITransacaoRepositorio _repositorio;
    private readonly IPessoaRepositorio _repositorioPessoa;
    private readonly ICategoriaRepositorio _repositorioCategoria;

    public TransacoesController(
        ITransacaoRepositorio repositorio,
        IPessoaRepositorio repositorioPessoa,
        ICategoriaRepositorio repositorioCategoria)
    {
        _repositorio = repositorio;
        _repositorioPessoa = repositorioPessoa;
        _repositorioCategoria = repositorioCategoria;
    }

    [HttpPost]
    public async Task<ActionResult<TransacaoResponse>> Criar(TransacaoRequest request)
    {
        var pessoa = await _repositorioPessoa.ObterPorIdAsync(request.PessoaId);
        var categoria = await _repositorioCategoria.ObterPorIdAsync(request.CategoriaId);

        if (pessoa == null || categoria == null)
            return BadRequest("Pessoa ou Categoria não encontradas.");

        // Regra de negócio: menor de 18 anos não pode registrar receita
        if (pessoa.Idade < 18 && request.Tipo == TipoTransacao.Receita)
        {
            return BadRequest(new { errors = new { Regra = new[] { "Menores de 18 anos não podem registrar Receitas, apenas Despesas." } } });
        }

        // Regra de negócio: a finalidade da categoria deve ser compatível com o tipo da transação
        if (request.Tipo == TipoTransacao.Despesa && (int)categoria.Finalidade == 1)
        {
            return BadRequest(new { errors = new { Regra = new[] { "Não pode lançar Despesa em uma categoria de Receita." } } });
        }

        if (request.Tipo == TipoTransacao.Receita && (int)categoria.Finalidade == 0)
        {
            return BadRequest(new { errors = new { Regra = new[] { "Não pode lançar Receita em uma categoria de Despesa." } } });
        }

        var transacao = new Transacao
        {
            Descricao = request.Descricao,
            Valor = request.Valor,
            Data = request.Data,
            Tipo = request.Tipo,
            PessoaId = request.PessoaId,
            CategoriaId = request.CategoriaId
        };

        await _repositorio.CriarAsync(transacao);

        var transacaoCompleta = await _repositorio.ObterPorIdAsync(transacao.Id);

        return CreatedAtAction(nameof(ObterPorId), new { id = transacao.Id },
            new TransacaoResponse(
                transacaoCompleta!.Id,
                transacaoCompleta.Descricao,
                transacaoCompleta.Valor,
                transacaoCompleta.Data,
                transacaoCompleta.Tipo,
                transacaoCompleta.PessoaId,
                transacaoCompleta.CategoriaId,
                transacaoCompleta.Pessoa,
                transacaoCompleta.Categoria
            ));
    }

    [HttpGet]
    public async Task<ActionResult<List<TransacaoResponse>>> Listar()
    {
        var transacoes = await _repositorio.ListarTodasAsync();

        var resposta = transacoes.Select(t => new TransacaoResponse(
            t.Id, t.Descricao, t.Valor, t.Data, t.Tipo, t.PessoaId, t.CategoriaId, t.Pessoa, t.Categoria
        )).ToList();

        return Ok(resposta);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransacaoResponse>> ObterPorId(int id)
    {
        var t = await _repositorio.ObterPorIdAsync(id);
        if (t == null) return NotFound();

        return Ok(new TransacaoResponse(t.Id, t.Descricao, t.Valor, t.Data, t.Tipo, t.PessoaId, t.CategoriaId, t.Pessoa, t.Categoria));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(int id, TransacaoRequest request)
    {
        var transacaoExistente = await _repositorio.ObterPorIdAsync(id);
        if (transacaoExistente == null) return NotFound();

        transacaoExistente.Descricao = request.Descricao;
        transacaoExistente.Valor = request.Valor;
        transacaoExistente.Data = request.Data;
        transacaoExistente.Tipo = request.Tipo;
        transacaoExistente.PessoaId = request.PessoaId;
        transacaoExistente.CategoriaId = request.CategoriaId;

        await _repositorio.AtualizarAsync(transacaoExistente);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        await _repositorio.DeletarAsync(id);
        return NoContent();
    }
}
