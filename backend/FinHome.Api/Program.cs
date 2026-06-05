using DotNetEnv;
using FinHome.Application.Behaviors;
using FinHome.Application.Validators;
using FinHome.Domain.Interfaces;
using FinHome.Infrastructure.Data;
using FinHome.Infrastructure.Repositories;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

// Npgsql 6+ maps DateTime to "timestamp with time zone" and rejects DateTimeKind.Unspecified.
// This switch restores the pre-6 behavior so plain DateTime values from API clients work as-is.
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Load .env file when running outside of a container that already injects secrets
var envPath = Path.Combine(
    Directory.GetParent(Directory.GetCurrentDirectory())?.Parent?.FullName ?? "",
    ".env");
if (File.Exists(envPath)) Env.Load(envPath);

// Connection string: prefer DefaultConnection, fall back to individual env vars
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    var host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
    var port = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";
    var db   = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "finhomedb";
    var user = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "postgres";
    var pass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
    connectionString = $"Host={host};Port={port};Database={db};Username={user};Password={pass}";
}

builder.Services.AddDbContext<AppDbContext>(o =>
{
    o.UseNpgsql(connectionString);
    // Enable sensitive data logging only in development to aid debugging
    if (builder.Environment.IsDevelopment())
        o.EnableSensitiveDataLogging().LogTo(Console.WriteLine, Microsoft.Extensions.Logging.LogLevel.Information);
});

// Repositories
builder.Services.AddScoped<IPersonRepository, PersonRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();

// MediatR — discovers all handlers in Application assembly
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreatePersonValidator).Assembly));

// FluentValidation — registers all validators in Application assembly
builder.Services.AddValidatorsFromAssembly(typeof(CreatePersonValidator).Assembly);

// Validation pipeline: automatically validates every command before the handler runs
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

builder.Services.AddCors(o => o.AddPolicy("AllowAll", p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new() { Title = "FinHome API", Version = "v1" });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();

app.UseMiddleware<FinHome.Api.Middleware.GlobalExceptionMiddleware>();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.Run();

// Needed for integration test WebApplicationFactory
public partial class Program { }
