using DotNetEnv;
using FinHome.Infra.Contexto;
using FinHome.Infra.Repositorios;
using FinHome.Dominio.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var diretorioRaiz = Directory.GetParent(Directory.GetCurrentDirectory())?.Parent?.FullName;
var caminhoEnv = Path.Combine(diretorioRaiz ?? "", ".env");

// Carrega variáveis locais para facilitar execução fora de ambientes que já injetam secrets (ex.: container/CI)
if (File.Exists(caminhoEnv)) Env.Load(caminhoEnv);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Fallback para montar a string de conexão via variáveis de ambiente quando não há DefaultConnection configurada
if (string.IsNullOrEmpty(connectionString))
{
    var dbName = Environment.GetEnvironmentVariable("POSTGRES_DB");
    var dbUser = Environment.GetEnvironmentVariable("POSTGRES_USER");
    var dbPass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
    var dbPort = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
    var dbHost = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
    connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPass}";
}

builder.Services.AddDbContext<AppDbContext>(opcoes => opcoes.UseNpgsql(connectionString));

builder.Services.AddScoped<IPessoaRepositorio, PessoaRepositorio>();
builder.Services.AddScoped<ICategoriaRepositorio, CategoriaRepositorio>();
builder.Services.AddScoped<ITransacaoRepositorio, TransacaoRepositorio>();

// Política ampla para permitir consumo do front durante o desenvolvimento
builder.Services.AddCors(opcoes =>
{
    opcoes.AddPolicy("PermitirTudo", politica =>
    {
        politica.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Evita erro de serialização por referência circular (ex.: Transacao -> Pessoa -> Transacoes)
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("PermitirTudo");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.Run();
