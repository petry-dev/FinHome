using FinHome.Dominio.Entidades;
using Microsoft.EntityFrameworkCore;

namespace FinHome.Infra.Contexto;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Pessoa> Pessoas { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Transacao> Transacoes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Ao remover uma Pessoa, todas as Transacoes associadas são removidas automaticamente (cascade delete)
        modelBuilder.Entity<Transacao>()
            .HasOne(t => t.Pessoa)
            .WithMany(p => p.Transacoes)
            .HasForeignKey(t => t.PessoaId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(modelBuilder);
    }
}
