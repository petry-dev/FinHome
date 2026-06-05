# Deployment

## Current setup (Docker Compose — local / VPS)

```
docker compose up --build
```

Three services defined in `docker-compose.yml`:

| Service | Image | Port |
|---|---|---|
| `db` | `mcr.microsoft.com/mssql/server:2022-latest` | 1433 |
| `api` | `./backend/Dockerfile` | 5000 |
| `frontend` | `./frontend/Dockerfile` (Nginx) | 3000 |

The API runs `MigrateAsync()` on startup so the database schema is always up-to-date on first boot.

---

## Proposed AWS topology

| Component | Role | Why |
|---|---|---|
| CloudFront | CDN + HTTPS termination | Serves static assets from S3 edge cache; routes `/api/*` to ALB |
| S3 | Static hosting | React build artifacts — zero server cost for frontend |
| ALB | Load balancer | Routes traffic to EC2 instances; handles TLS termination for the API |
| EC2 Auto Scaling | API runtime | Horizontal scaling based on CPU / request metrics |
| RDS SQL Server (Multi-AZ) | Database | Managed SQL Server with automatic failover, backups, patch management |
| Secrets Manager | Credentials | DB password injected at runtime; never stored in code or environment files |

Traffic path: browser → CloudFront → (S3 for static assets) or (ALB → EC2 → RDS for API calls).

---

## CI/CD pipeline

On every push or pull request to `main`, GitHub Actions runs two parallel jobs:

**Backend job**
1. `dotnet restore` + `dotnet build`
2. `dotnet test FinHome.UnitTests`
3. `dotnet test FinHome.IntegrationTests` (Testcontainers — real SQL Server container)

**Frontend job**
1. `npm ci`
2. `npm run build`

If all jobs pass, the deploy stage:
1. Builds and pushes the API Docker image to ECR.
2. Syncs the frontend build output to S3 (`aws s3 sync --delete`).
3. Triggers a rolling EC2 update via Auto Scaling launch template.
4. Database migrations run automatically via `MigrateAsync()` on API startup.

If any job fails, the merge is blocked and the developer is notified.

---

### Rollback

- **API** — redeploy previous ECR image tag via Auto Scaling launch template.
- **Frontend** — restore previous S3 objects from versioned bucket.
- **Database** — EF Core migrations are additive by convention; destructive changes require a manual rollback migration.

---

## Environment variables

| Variable | Used by | Description |
|---|---|---|
| `SQL_SERVER_HOST` | API | DB hostname |
| `SQL_SERVER_PORT` | API | DB port (default 1433) |
| `SQL_SERVER_DB` | API | Database name |
| `SQL_SERVER_PASSWORD` | API | SA password — injected from Secrets Manager in AWS |

Local development uses `.env` (git-ignored). Production uses AWS Secrets Manager + EC2 instance profile.
