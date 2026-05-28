using FinHome.Domain.Entities;
using FinHome.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinHome.Infrastructure.Data.Configurations;

public sealed class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("Transactions");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Description)
            .IsRequired()
            .HasMaxLength(400);

        builder.Property(t => t.Amount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(t => t.Date)
            .IsRequired();

        builder.Property(t => t.Type)
            .IsRequired();

        // Cascade: deleting a Person removes all their transactions
        builder.HasOne(t => t.Person)
            .WithMany(p => p.Transactions)
            .HasForeignKey(t => t.PersonId)
            .OnDelete(DeleteBehavior.Cascade);

        // Cascade: deleting a Category removes associated transactions
        builder.HasOne(t => t.Category)
            .WithMany(c => c.Transactions)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Index for date-range queries and ordering
        builder.HasIndex(t => t.Date)
            .HasDatabaseName("IX_Transactions_Date");

        // Composite index for report queries filtering by type within a date range
        builder.HasIndex(t => new { t.Date, t.Type })
            .HasDatabaseName("IX_Transactions_Date_Type");

        // FK indexes (EF adds these automatically, but explicit for clarity)
        builder.HasIndex(t => t.PersonId)
            .HasDatabaseName("IX_Transactions_PersonId");

        builder.HasIndex(t => t.CategoryId)
            .HasDatabaseName("IX_Transactions_CategoryId");
    }
}
