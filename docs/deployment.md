# Deployment

## Current setup (Docker Compose — local / VPS)

```
docker compose up --build
```

Three services defined in `docker-compose.yml`:

| Service | Image | Port |
|---|---|---|
| `db` | `postgres:16-alpine` | 5432 |
| `api` | `./backend/Dockerfile` | 5000 |
| `frontend` | `./frontend/Dockerfile` (Nginx) | 3000 |

The API runs `MigrateAsync()` on startup so the database schema is always up-to-date on first boot.

---

## Proposed AWS topology

```mermaid
graph TD
    User["User (browser)"]
    CF["CloudFront CDN\n(HTTPS termination)"]
    S3["S3 Bucket\n(React SPA static files)"]
    ALB["Application Load Balancer\n(HTTP → HTTPS redirect)"]
    EC2["EC2 Auto Scaling Group\n(FinHome.Api — .NET 8)\nPrivate subnet"]
    RDS["RDS PostgreSQL\n(Multi-AZ)\nPrivate subnet"]
    Secrets["AWS Secrets Manager\n(DB credentials)"]

    User -->|HTTPS| CF
    CF -->|Origin: S3| S3
    CF -->|Origin: /api/*| ALB
    ALB --> EC2
    EC2 -->|TCP 1433| RDS
    EC2 -->|Fetch secret| Secrets
```

### Component rationale

| Component | Role | Why |
|---|---|---|
| CloudFront | CDN + HTTPS | Serves static assets from S3 edge cache; routes `/api/*` to ALB |
| S3 | Static hosting | React build artifacts — zero server cost for frontend |
| ALB | Load balancer | Routes traffic to EC2 instances; handles TLS termination for API |
| EC2 Auto Scaling | API runtime | Horizontal scaling based on CPU/request metrics |
| RDS PostgreSQL (Multi-AZ) | Database | Managed PostgreSQL with automatic failover, backups, patch management |
| Secrets Manager | Credentials | DB password injected at runtime; never stored in code or environment files |

---

## CI/CD pipeline

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant CI as GitHub Actions
    participant ECR as ECR / S3
    participant AWS as AWS (EC2 + RDS)

    Dev->>GH: git push to main (or open PR)
    GH->>CI: Trigger workflow

    par Backend job
        CI->>CI: dotnet restore + build
        CI->>CI: dotnet test FinHome.UnitTests
        CI->>CI: dotnet test FinHome.IntegrationTests (Testcontainers)
    and Frontend job
        CI->>CI: npm ci
        CI->>CI: npm run build
    end

    alt All jobs pass
        CI->>ECR: Push Docker image (API)
        CI->>S3: Sync frontend build artifacts
        CI->>AWS: Rolling update (EC2 launch template → new AMI or ECS task)
        CI->>AWS: RDS migration runs via API startup MigrateAsync()
    else Any job fails
        CI->>GH: Block merge / notify developer
    end
```

### Deploy flow

1. **Backend** — Docker image built and pushed to ECR. EC2 Auto Scaling Group performs a rolling replacement using the new image.
2. **Frontend** — `npm run build` output synced to S3 with `aws s3 sync --delete`. CloudFront invalidation flushes the CDN cache.
3. **Database migrations** — `MigrateAsync()` on API startup applies pending migrations. No manual migration steps.

### Rollback

- API: redeploy previous ECR image tag via Auto Scaling launch template.
- Frontend: restore previous S3 objects from versioned bucket.
- Database: EF Core migrations are additive by convention; destructive changes require a manual rollback migration.

---

## Environment variables

| Variable | Used by | Description |
|---|---|---|
| `POSTGRES_HOST` | API | DB hostname |
| `POSTGRES_PORT` | API | DB port (default 5432) |
| `POSTGRES_DB` | API | Database name |
| `POSTGRES_USER` | API | DB username (default `postgres`) |
| `POSTGRES_PASSWORD` | API | DB password — injected from Secrets Manager in AWS |

Local development uses `.env` (git-ignored). Production uses AWS Secrets Manager + EC2 instance profile.
