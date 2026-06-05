# Planejamento — feat/auth

Branch: `feat/auth` (a criar a partir de `main`)
Objetivo: adicionar autenticação JWT real, escopo de dados por dono e estrutura de auth no frontend.

---

## Decisões de design

| # | Decisão | Escolha | Status |
|---|---|---|---|
| D1 | Banco de dados | **PostgreSQL 15** | ✅ resolvido — stack migrada |
| D2 | OwnerId em Transaction | **Coluna direta** em Transaction — filtragem sem join | ✅ resolvido |
| D3 | Refresh token storage (frontend) | **localStorage** com nota documentada — cookie exigiria credenciais CORS | ✅ resolvido |
| D4 | Credenciais do seed de demo | `demo@finhome.dev / Demo@1234` | ✅ resolvido |

---

## Estado atual do repositório

| Aspecto | Situação |
|---|---|
| Autenticação | Nenhuma — todos os endpoints abertos, sem `[Authorize]` |
| `Program.cs` | Sem `AddAuthentication` nem `AddAuthorization` |
| Banco | PostgreSQL 15 com 3 tabelas: People, Categories, Transactions |
| Frontend | Next.js 16, App Router, sem rotas protegidas |
| Testes | 68 unit + 16 integração (Testcontainers PostgreSQL) + 33 Vitest frontend |

---

## Plano de execução — 19 commits

### Legenda de status
- `[ ]` — pendente
- `[x]` — concluído
- `[~]` — em andamento

---

### Setup

| Status | # | Commit | Arquivos / mudanças |
|---|---|---|---|
| `[ ]` | 1 | `chore: add CLAUDE.md and settings to .gitignore` | `.gitignore` na raiz; `backend/.claude/settings.local.json` |

---

### Domain

| Status | # | Commit | Arquivos / mudanças |
|---|---|---|---|
| `[ ]` | 2 | `feat(domain): add User and RefreshToken entities` | `Domain/Entities/User.cs`, `Domain/Entities/RefreshToken.cs`, `Domain/Interfaces/IUserRepository.cs` |
| `[ ]` | 3 | `feat(domain): add ICurrentUser and ITokenService interfaces` | `Domain/Interfaces/ICurrentUser.cs`, `Domain/Interfaces/ITokenService.cs` |

**Como fazer — commit 2:**
```csharp
public class User {
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;   // único, max 254
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<RefreshToken> RefreshTokens { get; set; } = new();
    public List<Person> People { get; set; } = new();
    public List<Category> Categories { get; set; } = new();
}

public class RefreshToken {
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User? User { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

**Como fazer — commit 3:**
```csharp
public interface ICurrentUser {
    int UserId { get; }
    string Email { get; }
}

public interface ITokenService {
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    int AccessTokenExpiryMinutes { get; }
    int RefreshTokenExpiryDays { get; }
}
```

---

### Infrastructure

| Status | # | Commit | Arquivos / mudanças |
|---|---|---|---|
| `[ ]` | 4 | `feat(infra): add OwnerId FK to Person, Category and Transaction` | Atualiza entidades e configurações EF |
| `[ ]` | 5 | `feat(infra): configure User and RefreshToken with EF Core` | `UserConfiguration.cs`, `RefreshTokenConfiguration.cs`, `AppDbContext` |
| `[ ]` | 6 | `feat(infra): add UserRepository and TokenService` | `Repositories/UserRepository.cs`, `Auth/TokenService.cs` |
| `[ ]` | 7 | `feat(infra): add migration AddAuthAndOwnerId` | `dotnet ef migrations add AddAuthAndOwnerId --project FinHome.Infrastructure --startup-project FinHome.Api` |

**Como fazer — commit 4:**
```csharp
// Em cada entidade (Person, Category, Transaction)
public int OwnerId { get; set; }
public User? Owner { get; set; }

// PersonConfiguration / CategoryConfiguration
builder.HasOne(p => p.Owner)
    .WithMany(u => u.People)
    .HasForeignKey(p => p.OwnerId)
    .OnDelete(DeleteBehavior.Cascade);
builder.HasIndex(p => p.OwnerId).HasDatabaseName("IX_People_OwnerId");

// TransactionConfiguration: DeleteBehavior.Restrict (cascade já vem de Person)
```

**Como fazer — commit 5:**
```csharp
// UserConfiguration
builder.ToTable("Users");
builder.Property(u => u.Email).IsRequired().HasMaxLength(254);
builder.HasIndex(u => u.Email).IsUnique().HasDatabaseName("IX_Users_Email");

// RefreshTokenConfiguration
builder.ToTable("RefreshTokens");
builder.Property(r => r.Token).IsRequired().HasMaxLength(64);
builder.HasIndex(r => r.Token).HasDatabaseName("IX_RefreshTokens_Token");
builder.HasOne(r => r.User).WithMany(u => u.RefreshTokens)
    .HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
```

**Pacotes necessários:**
- `FinHome.Api.csproj`: `Microsoft.AspNetCore.Authentication.JwtBearer 8.0.x`
- `FinHome.Infrastructure.csproj`: `System.IdentityModel.Tokens.Jwt 7.x`, `Microsoft.Extensions.Identity.Core 8.0.x`

---

### Application

| Status | # | Commit | Arquivos / mudanças |
|---|---|---|---|
| `[ ]` | 8 | `feat(application): add auth command handlers` | `Features/Auth/Commands/`, `Validators/RegisterValidator.cs`, `LoginValidator.cs`, `Features/Auth/AuthDto.cs` |
| `[ ]` | 9 | `feat(application): scope all queries and commands by OwnerId` | Atualiza todos os handlers existentes |

**Como fazer — commit 8:**
```csharp
public record AuthResponseDto(string AccessToken, string RefreshToken, int ExpiresIn);

// RegisterCommand: verifica email único → hash senha → salva User → gera tokens → Result<AuthResponseDto>
// LoginCommand: busca user → verifica hash → gera tokens → Result<AuthResponseDto>
// RefreshCommand: busca token → valida → revoga → gera novo par → Result<AuthResponseDto>
// LogoutCommand: busca token → marca IsRevoked = true → Result.Success()
```

**Como fazer — commit 9:**
```csharp
// Queries: adicionar .Where(p => p.OwnerId == _currentUser.UserId)
// Creates: new Person { ..., OwnerId = _currentUser.UserId }
// Get/Update/Delete: após buscar, verificar resource.OwnerId != _currentUser.UserId → Result.NotFound()
```

---

### Api

| Status | # | Commit | Arquivos / mudanças |
|---|---|---|---|
| `[ ]` | 10 | `feat(api): add JWT Bearer auth, global Authorize policy and CurrentUser` | `Program.cs`, `Services/CurrentUserService.cs` |
| `[ ]` | 11 | `feat(api): add AuthController` | `Controllers/AuthController.cs` |

**Como fazer — commit 10:**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => {
        o.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]
                    ?? throw new InvalidOperationException("Jwt:Secret not configured."))),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddControllers(o => o.Filters.Add(new AuthorizeFilter()));
// pipeline: app.UseAuthentication(); app.UseAuthorization();
```

**Como fazer — commit 11:**
```csharp
[ApiController, Route("api/auth"), AllowAnonymous]
public class AuthController : ControllerBase {
    // POST /api/auth/register → 201 + AuthResponseDto
    // POST /api/auth/login    → 200 + AuthResponseDto
    // POST /api/auth/refresh  → 200 + AuthResponseDto
    // POST /api/auth/logout   → 204
}
```

---

### Tests

| Status | # | Commit | Arquivos / mudanças |
|---|---|---|---|
| `[ ]` | 12 | `test: update existing tests for OwnerId and auth` | Mock `ICurrentUser` nos unit tests; helper de auth no `ApiFactory.cs` |
| `[ ]` | 13 | `test: add auth integration tests and cross-user isolation` | `AuthEndpointTests.cs` |

**Como fazer — commit 12:**
```csharp
// ApiFactory.cs — helper para autenticar cliente de teste
public async Task<string> GetAuthTokenAsync(HttpClient client) {
    var resp = await client.PostAsJsonAsync("/api/auth/register",
        new { Email = "test@test.com", Password = "Test@1234" });
    var dto = await resp.Content.ReadFromJsonAsync<AuthResponseDto>();
    return dto!.AccessToken;
}
```

**Cenários obrigatórios — commit 13:**
- `POST /register` válido → 201
- `POST /register` email repetido → 409
- `POST /login` senha correta → 200 + tokens
- `POST /login` senha errada → 401
- `POST /refresh` token válido → 200 + novos tokens
- `POST /refresh` token revogado → 401
- `GET /api/people` sem token → 401
- Usuário A cria Person; usuário B tenta acessar → 404

---

### Seed

| Status | # | Commit | Arquivos / mudanças |
|---|---|---|---|
| `[ ]` | 14 | `feat(infra): add demo seed with user and sample data` | `Infrastructure/Data/DataSeeder.cs` |

```csharp
// Verifica se já existe User; se não, cria:
//   demo@finhome.dev / Demo@1234 (hash com PasswordHasher)
//   3 categorias: Alimentação (Expense), Salário (Income), Outros (Both)
//   1 pessoa: "Demo User", 30 anos
//   10 transações nos últimos 3 meses
```

---

### Frontend

| Status | # | Commit | Arquivos / mudanças |
|---|---|---|---|
| `[ ]` | 15 | `feat(frontend): add AuthContext and Axios interceptor` | `src/presentation/contexts/AuthContext.tsx`; atualiza `src/infrastructure/api/client.ts` |
| `[ ]` | 16 | `feat(frontend): add Login and Register pages` | `src/app/login/page.tsx`, `src/app/register/page.tsx`, `src/presentation/pages/LoginPage.tsx`, `src/presentation/pages/RegisterPage.tsx` |
| `[ ]` | 17 | `feat(frontend): add protected routes via Next.js middleware` | `middleware.ts` na raiz de `src/`; atualiza `src/app/layout.tsx` |

**Como fazer — commit 15:**

Estratégia de armazenamento:
- `accessToken`: em memória (estado do React Context) — nunca persiste
- `refreshToken`: em `localStorage` — persiste sessão, trocado a cada refresh

```tsx
// src/presentation/contexts/AuthContext.tsx
interface AuthContextValue {
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
```

```ts
// client.ts — interceptor de resposta (refresh automático)
apiClient.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const { data } = await apiClient.post('/api/auth/refresh', { refreshToken });
        original.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return apiClient(original);
      }
    }
    return Promise.reject(err);
  }
);
```

**Como fazer — commit 16:**
- `src/app/login/page.tsx` e `src/app/register/page.tsx` — pages do App Router que renderizam os componentes de apresentação
- `src/presentation/pages/LoginPage.tsx` e `RegisterPage.tsx` — formulários com validação client-side e `parseProblemDetail` para erros

**Como fazer — commit 17:**
```ts
// src/middleware.ts — Next.js middleware (executado no edge, antes de qualquer page)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken') // ou checar localStorage via API route
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register')

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

### Docs + CI

| Status | # | Commit | Arquivos / mudanças |
|---|---|---|---|
| `[ ]` | 18 | `docs: document JWT setup and env vars` | Atualiza `README.md` — seção de variáveis de ambiente |
| `[ ]` | 19 | `ci: add JWT_SECRET to GitHub Actions pipeline` | `.github/workflows/ci.yml` + instrução de adicionar secret no repo |

**Como fazer — commit 18:**
```
JWT_SECRET=<string aleatória, mínimo 32 caracteres>
```
Configuração local: `dotnet user-secrets set "Jwt:Secret" "sua-chave-aqui"`

**Como fazer — commit 19:**
```yaml
env:
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

---

## Ordem de execução

```
1 → 2 → 3 → 4 → 5 → 6 → 7   (domain + infra — rodar antes de testar)
→ 8 → 9                        (application)
→ 10 → 11                      (api)
→ 12 → 13                      (testes — dotnet test antes de continuar)
→ 14                            (seed)
→ 15 → 16 → 17                 (frontend)
→ 18 → 19                      (docs + ci)
```
