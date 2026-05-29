CLAUDE.md — FinHome
Guia de contexto e instruções para o Claude Code trabalhar neste repositório.

Contexto do Projeto
FinHome é um sistema de controle de gastos residenciais desenvolvido como teste técnico para uma vaga Sênior Fullstack. O projeto foi reprovado com o feedback de que não demonstrava o nível de profundidade esperado para a posição — especialmente no uso do Entity Framework e na falta de testes automatizados.
Objetivo atual elevar o projeto ao nível sênior real, transformando-o em um case forte de portfólio.

Stack
CamadaTecnologiaBackend.NET 8, C# 12, ASP.NET CoreORMEntity Framework Core 8BancoPostgreSQL 15FrontendReact 18, TypeScript 5, Vite 5ContainerDocker + docker-composeTestesxUnit, FluentAssertions, Testcontainers (meta)CICDGitHub Actions

Arquitetura
Clean Architecture com 4 projetos no backend
backend
  FinHome.Domain          # Entidades, interfaces de repositório, regras de domínio puras
  FinHome.Application     # DTOs, serviços de aplicação, orquestração de casos de uso
  FinHome.Infrastructure  # EF Core, AppDbContext, repositórios, migrations
  FinHome.Api             # Controllers, DI, middlewares, Swagger
  FinHome.Tests           # xUnit — testes unitários e de integração
frontend
  src
    components            # Componentes reutilizáveis
    pages                 # Páginas por módulo (Pessoas, Categorias, Transações, Relatórios)
    services              # Chamadas à API
    hooks                 # Custom hooks
    types                 # Tipos TypeScript
Regra de dependência Domain ← Application ← InfrastructureApi. Nunca o inverso.

Regras de Negócio (não negociáveis)
Estas regras precisam estar cobertas por testes e validadas no domínio — não apenas no controller
Pessoas

CRUD completo
Nome máximo 200 caracteres, obrigatório
Idade inteiro positivo, obrigatório
Cascade delete ao deletar uma pessoa, todas as suas transações são removidas

Categorias

Criação e listagem
Descrição máximo 400 caracteres, obrigatório
Finalidade enum — Despesa, Receita, Ambas

Transações

Criação e listagem
Descrição máximo 400 caracteres, obrigatório
Valor decimal positivo, obrigatório
Tipo enum — Despesa ou Receita
Regra 1 — Menor de idade pessoa com idade  18 só pode ter transações do tipo Despesa
Regra 2 — Consistência categoriatipo o Tipo da transação deve ser compatível com a Finalidade da categoria

Categoria Despesa → aceita apenas tipo Despesa
Categoria Receita → aceita apenas tipo Receita
Categoria Ambas → aceita qualquer tipo



Relatórios

Totais por pessoa receitas, despesas e saldo individual + total geral
Totais por categoria (opcional, mas valorizado)


Plano de Elevação — Eixos de Trabalho
Trabalhar nesta ordem. Commitar incrementalmente a cada eixo concluído.
Eixo 1 — Testes (prioridade máxima)
O que fazer

Criar projeto FinHome.Tests com xUnit + FluentAssertions
Testes unitários de domínio cobrindo todas as regras de negócio

Validação de menor de idade ( 18 → só Despesa)
Consistência categoriatipo (todos os casos do enum)
Validações de tamanho (nome  200, descrição  400)
Valor de transação negativo ou zero
Cascade delete (verificar que o repositórioserviço dispara corretamente)


Testes de integração dos endpoints com Testcontainers (PostgreSQL real, sem mock de banco)
Edge cases obrigatórios

Criar transação com categoria Ambas (deve aceitar ambos os tipos)
Deletar pessoa que não existe (404 limpo)
Transação com valor 0 (deve rejeitar)
Pessoa com idade exatamente 18 (deve aceitar Receita)
Pessoa com idade 17 tentando criar Receita (deve rejeitar)



Padrão de commit
test add domain unit tests for business rules
test add integration tests for Pessoas endpoints
test add edge cases for minor age and category validation

Eixo 2 — Qualidade da API
O que fazer

Implementar Result pattern para erros esperados (evitar exceptions para controle de fluxo)

csharp   Exemplo ao invés de throw InvalidOperationException
  return Result.Failure(Menor de 18 anos não pode ter transações de Receita.);

Problem Details (RFC 7807) padronizar todas as respostas de erro

json  {
    type httpsfinhome.deverrorsbusiness-rule-violation,
    title Regra de negócio violada,
    status 422,
    detail Menor de 18 anos não pode registrar transações de Receita.,
    instance transacoes
  }

Status codes corretos

201 Created (POST bem-sucedido)
204 No Content (DELETE bem-sucedido)
400 Bad Request (validação de entrada)
404 Not Found (recurso não encontrado)
422 Unprocessable Entity (regra de negócio violada)


Paginação nas listagens de Pessoas, Categorias e Transações

Query params page=1&pageSize=20
Response envelope com totalCount, page, pageSize, data


FluentValidation para validação de entrada nos DTOs (separado das regras de domínio)

Padrão de commit
refactor implement Result pattern replacing exception-based flow control
feat add Problem Details (RFC 7807) for error responses
feat add pagination to list endpoints
feat add FluentValidation for input DTOs

Eixo 3 — Arquitetura e Código
O que fazer

Revisar separação de responsabilidades

Regras de negócio devem estar no Domain ou Application, nunca no controller
Controllers só orquestram recebem request → chamam serviço → retornam response
EF Core só no Infrastructure — Domain não deve referenciar EF


Aplicar SOLID onde fizer sentido real (não forçado)

SRP cada serviço tem uma responsabilidade
OCP enum Finalidade + validação deve ser extensível sem modificar regras existentes
DIP controllers dependem de interfaces, não de implementações concretas


Boas práticas de EF Core (ponto do feedback da reprovação)

Usar AsNoTracking() em queries de leitura
Evitar N+1 com .Include() explícito onde necessário
Configurar relacionamentos via Fluent API (não DataAnnotations) no OnModelCreating
Índices nas FKs


Comentários de código nas regras de negócio críticas (não comentar o óbvio)

Padrão de commit
refactor move business rules from controllers to domainapplication layer
refactor fix EF Core queries - add AsNoTracking and proper Includes
refactor configure relationships via Fluent API in OnModelCreating

Eixo 4 — Frontend
O que fazer

Loading states em todas as operações assíncronas
Tratamento de erros com feedback visual (toastalert com mensagem do Problem Details)
Validação de formulários no cliente antes de submeter (evitar round-trip desnecessário)
Tipar corretamente as respostas da API (sem any)
Componentização extrair componentes reutilizáveis (tabelas, formulários, modais)
Estado global mínimo com Context API ou Zustand (sem over-engineering)

Padrão de commit
feat(frontend) add loading states and error handling to all async operations
feat(frontend) add client-side form validation
refactor(frontend) extract reusable Table and Modal components

Eixo 5 — CICD
O que fazer

GitHub Actions pipeline em .githubworkflowsci.yml

Trigger push e PR na branch main
Jobs build do backend → testes → build do frontend
Pipeline deve falhar se algum teste quebrar
Usar PostgreSQL como service no GitHub Actions para testes de integração



yaml# Estrutura esperada do workflow
name CI
on
  push
    branches [main]
  pull_request
    branches [main]
jobs
  backend
    runs-on ubuntu-latest
    services
      postgres
        image postgres15-alpine
        env
          POSTGRES_PASSWORD test
        options -
          --health-cmd pg_isready
          --health-interval 10s
    steps
      - uses actionscheckout@v4
      - uses actionssetup-dotnet@v4
        with
          dotnet-version '8.0.x'
      - run dotnet build
      - run dotnet test --no-build
  frontend
    runs-on ubuntu-latest
    steps
      - uses actionscheckout@v4
      - uses actionssetup-node@v4
        with
          node-version '20'
      - run npm ci
      - run npm run build
Padrão de commit
ci add GitHub Actions pipeline for build and test
ci add PostgreSQL service for integration tests

Eixo 6 — Documentação
O que fazer

README de nível sênior contendo

Visão geral e propósito
Diagrama de arquitetura (mermaid ou imagem)
Decisões de arquitetura e o porquê de cada uma
Como rodar (Docker e local)
Como rodar os testes
Estrutura de pastas explicada
Endpoints documentados (ou link para Swagger)


Swagger com exemplos de requestresponse e descrições nos endpoints

Padrão de commit
docs rewrite README with architecture decisions and setup guide
docs add Swagger examples and endpoint descriptions

Padrões de Commit
Usar Conventional Commits sempre. Histórico incremental — nunca um commit gigante.
feat      nova funcionalidade
fix       correção de bug
refactor  refatoração sem mudança de comportamento
test      adição ou correção de testes
docs      documentação
ci        pipeline e automação
chore     tarefas de manutenção

O que NÃO fazer

Não mover regras de negócio para os controllers
Não usar exceptions para controle de fluxo esperado (ex pessoa não encontrada)
Não fazer queries EF Core sem AsNoTracking() em operações de leitura
Não commitar em bloco — um commit por mudança coesa
Não adicionar abstrações desnecessárias (over-engineering)
Não mockar o banco nos testes de integração — usar Testcontainers


Como Rodar Localmente
bash# Subir toda a stack
cp .env.example .env
docker-compose up --build

# Rodar testes (após implementados)
cd backend
dotnet test

# Frontend em modo dev
cd frontend
npm install
npm run dev
API disponível em httplocalhost5000
Swagger em httplocalhost5000swagger
Frontend em httplocalhost3000