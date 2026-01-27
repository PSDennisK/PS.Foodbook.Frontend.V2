# Deployment Guide - PS Foodbook App

## Overview

This guide provides step-by-step instructions for deploying the PS Foodbook application to different environments. The application is containerized using Docker and can be deployed using Docker Compose, Kubernetes, or direct Docker commands.

**Deployment Strategy**: Blue-green deployment with zero-downtime updates

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Deployment Methods](#deployment-methods)
   - [Docker Compose (Recommended)](#docker-compose-recommended)
   - [Direct Docker](#direct-docker)
   - [Kubernetes](#kubernetes)
5. [Environment-Specific Deployments](#environment-specific-deployments)
   - [Development](#development)
   - [Staging](#staging)
   - [Production](#production)
6. [CI/CD Automated Deployment](#cicd-automated-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Zero-Downtime Deployment](#zero-downtime-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows with WSL2
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **Minimum Resources**:
  - 2 CPU cores
  - 2 GB RAM
  - 10 GB disk space

### Required Access

- [ ] Access to Docker image registry (Docker Hub, AWS ECR, or private registry)
- [ ] Access to environment configuration files (.env.production)
- [ ] Access to backend API endpoint
- [ ] SSH access to production servers
- [ ] Access to monitoring dashboards (Sentry)

### Required Secrets

Before deployment, ensure you have:

1. **JWT_SECRET**: Min 32 characters, cryptographically random
2. **PERMALINK_SECRET**: Unique secret for permalink generation
3. **FOODBOOK_API_URL**: Backend API endpoint
4. **SENTRY_DSN** (optional): For error monitoring

Generate secrets:
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate permalink secret
openssl rand -base64 32
```

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`npm test -- --run`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] Code reviewed and approved

### Build Verification

- [ ] Production build successful (`npm run build`)
- [ ] Docker image builds without errors
- [ ] Image size reasonable (< 500MB)
- [ ] No security vulnerabilities in dependencies (`npm audit`)

### Configuration

- [ ] Environment variables configured for target environment
- [ ] Secrets rotated if necessary
- [ ] Backend API accessible from deployment environment
- [ ] Domain DNS configured correctly
- [ ] SSL certificates valid and not expiring soon

### Documentation

- [ ] CHANGELOG updated with new changes
- [ ] README updated if architecture changed
- [ ] RUNBOOK updated with operational changes
- [ ] Deployment documented in incident log

### Backups

- [ ] Current production state backed up
- [ ] Previous Docker image tagged as backup
- [ ] Environment configuration backed up
- [ ] Database backup completed (if applicable)

### Communication

- [ ] Stakeholders notified of deployment window
- [ ] Status page updated (if planned downtime)
- [ ] On-call engineer available during deployment

---

## Environment Setup

### Environment Files

Each environment has its own configuration file:

```
.env.development    # Local development
.env.staging        # Staging environment
.env.production     # Production environment
```

Copy the example file and configure:

```bash
# For production
cp .env.production.example .env.production

# Edit with appropriate values
nano .env.production
```

### Required Environment Variables

#### Critical (Must Configure)

```bash
# Application
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://foodbook.psinfoodservice.com

# Backend API
FOODBOOK_API_URL=https://api.psinfoodservice.com
FOODBOOK_API_TIMEOUT=15000

# Security
JWT_SECRET=<your-secure-32-char-secret>
COOKIE_DOMAIN=.psinfoodservice.com
PERMALINK_SECRET=<your-secure-secret>
```

#### Important (Recommended)

```bash
# Session
SESSION_DURATION=86400

# Caching
CACHE_REVALIDATE=300
CACHE_STALE_WHILE_REVALIDATE=600

# Feature Flags
FEATURE_IMPACT_SCORE=true
FEATURE_PDF_GENERATION=true
```

#### Optional (Monitoring)

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=ps-foodbook

# Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Environment Validation

Validate environment configuration before deployment:

```bash
# Check required variables are set
required_vars=("JWT_SECRET" "FOODBOOK_API_URL" "NEXT_PUBLIC_APP_URL")

for var in "${required_vars[@]}"; do
  if ! grep -q "^$var=" .env.production; then
    echo "ERROR: Missing required variable: $var"
    exit 1
  fi
done

echo "Environment validation passed"
```

---

## Deployment Methods

### Docker Compose (Recommended)

Docker Compose is the recommended deployment method for single-server deployments.

#### Step 1: Prepare Configuration

```bash
# Clone repository (if not already)
git clone <repository-url>
cd PS.Foodbook.Frontend.v2

# Checkout desired version
git checkout v1.0.0  # Or specific commit/branch

# Copy environment file
cp .env.production.example .env.production

# Edit environment variables
nano .env.production
```

#### Step 2: Build and Start

```bash
# Build Docker image
docker-compose build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Step 3: Verify Deployment

```bash
# Check container status
docker-compose ps

# Test health endpoint
curl http://localhost:3000/api/health

# Expected output:
# {"status":"ok","timestamp":"2026-01-27T12:00:00.000Z","environment":"production","version":"1.0.0"}
```

#### docker-compose.yml Reference

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ps-foodbook-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

### Direct Docker

For more control or custom setups, use Docker commands directly.

#### Step 1: Build Image

```bash
# Build image with tag
docker build -t ps-foodbook-app:v1.0.0 .

# Tag as latest
docker tag ps-foodbook-app:v1.0.0 ps-foodbook-app:latest
```

#### Step 2: Run Container

```bash
# Stop existing container (if running)
docker stop ps-foodbook-app 2>/dev/null || true
docker rm ps-foodbook-app 2>/dev/null || true

# Run new container
docker run -d \
  --name ps-foodbook-app \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  --memory="2g" \
  --cpus="2" \
  --health-cmd="wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  ps-foodbook-app:latest
```

#### Step 3: Verify

```bash
# Check container is running
docker ps | grep ps-foodbook-app

# Check logs
docker logs -f ps-foodbook-app

# Test health endpoint
curl http://localhost:3000/api/health
```

---

### Kubernetes

For large-scale deployments, use Kubernetes.

#### Step 1: Create Namespace

```bash
kubectl create namespace ps-foodbook
```

#### Step 2: Create ConfigMap for Environment

```bash
# Create configmap from .env.production
kubectl create configmap ps-foodbook-config \
  --from-env-file=.env.production \
  -n ps-foodbook
```

#### Step 3: Create Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ps-foodbook-app
  namespace: ps-foodbook
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ps-foodbook-app
  template:
    metadata:
      labels:
        app: ps-foodbook-app
    spec:
      containers:
      - name: app
        image: ps-foodbook-app:v1.0.0
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: ps-foodbook-config
        resources:
          requests:
            memory: "1Gi"
            cpu: "1"
          limits:
            memory: "2Gi"
            cpu: "2"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 40
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: ps-foodbook-service
  namespace: ps-foodbook
spec:
  selector:
    app: ps-foodbook-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

#### Step 4: Deploy

```bash
# Apply deployment
kubectl apply -f k8s-deployment.yaml

# Check deployment status
kubectl get deployments -n ps-foodbook

# Check pods
kubectl get pods -n ps-foodbook

# View logs
kubectl logs -f deployment/ps-foodbook-app -n ps-foodbook
```

#### Step 5: Expose Service

```bash
# Get service external IP
kubectl get service ps-foodbook-service -n ps-foodbook

# Test
curl http://<EXTERNAL-IP>/api/health
```

---

## Environment-Specific Deployments

### Development

Development environment for local testing.

#### Configuration

```bash
# Use development environment file
cp .env.development.example .env.development

# Start with hot-reload
npm run dev
```

**Environment Settings**:
- `NEXT_PUBLIC_APP_ENV=development`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- Logging: DEBUG level
- Caching: Disabled or very short (10s)

#### Docker Development

```bash
# Build and run development container
docker-compose -f docker-compose.dev.yml up --build

# Access dev server with hot-reload
open http://localhost:3000
```

---

### Staging

Staging environment mirrors production for testing.

#### Configuration

```bash
# Use staging environment file
cp .env.staging.example .env.staging
nano .env.staging
```

**Environment Settings**:
- `NEXT_PUBLIC_APP_ENV=staging`
- `NEXT_PUBLIC_APP_URL=https://staging.foodbook.psinfoodservice.com`
- Backend: `https://staging-api.psinfoodservice.com`
- Logging: DEBUG level
- Caching: Short duration (60s)
- Monitoring: Enabled (separate Sentry project)

#### Deployment Steps

```bash
# SSH to staging server
ssh user@staging.psinfoodservice.com

# Navigate to app directory
cd /opt/ps-foodbook

# Pull latest code
git fetch origin
git checkout staging

# Pull or build Docker image
docker-compose pull  # If using registry
# OR
docker-compose build # If building locally

# Deploy
docker-compose down
docker-compose up -d

# Verify
curl https://staging.foodbook.psinfoodservice.com/api/health
```

#### Automated Staging Deployment

Staging can be automatically deployed on push to `staging` branch:

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging
on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: |
          # Deploy to staging server
          ssh deploy@staging.psinfoodservice.com 'cd /opt/ps-foodbook && ./deploy.sh'
```

---

### Production

Production environment requires the highest level of care.

#### Configuration

```bash
# Use production environment file
cp .env.production.example .env.production

# Edit with production values
# IMPORTANT: Use strong secrets!
nano .env.production
```

**Environment Settings**:
- `NEXT_PUBLIC_APP_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://foodbook.psinfoodservice.com`
- Backend: `https://api.psinfoodservice.com`
- Logging: INFO level
- Caching: Long duration (300s)
- Monitoring: Enabled (production Sentry)
- Analytics: Enabled (GTM, GA)

#### Pre-Production Steps

1. **Test in Staging**
   ```bash
   # Run smoke tests on staging
   npm run test:e2e -- --base-url=https://staging.foodbook.psinfoodservice.com
   ```

2. **Backup Current State**
   ```bash
   # Backup current Docker image
   docker tag ps-foodbook-app:latest ps-foodbook-app:backup-$(date +%Y%m%d)

   # Backup environment config
   cp .env.production .env.production.backup-$(date +%Y%m%d)
   ```

3. **Schedule Maintenance Window**
   - Notify stakeholders 48 hours in advance
   - Update status page
   - Choose low-traffic time (e.g., Sunday 2:00-4:00 AM UTC)

#### Production Deployment Steps

**Method 1: Blue-Green Deployment (Zero Downtime)**

```bash
# See "Zero-Downtime Deployment" section below
```

**Method 2: Standard Deployment (Brief Downtime)**

```bash
# SSH to production server
ssh user@production.psinfoodservice.com

# Navigate to app directory
cd /opt/ps-foodbook

# Pull latest version
git fetch origin
git checkout v1.0.0  # Specific version tag

# Build new image
docker build -t ps-foodbook-app:v1.0.0 .
docker tag ps-foodbook-app:v1.0.0 ps-foodbook-app:latest

# Stop current container (downtime begins)
docker-compose down

# Start new container
docker-compose up -d

# Monitor startup
docker-compose logs -f
```

**Expected Downtime**: 30-60 seconds

#### Post-Production Steps

1. **Verify Health**
   ```bash
   curl https://foodbook.psinfoodservice.com/api/health
   ```

2. **Smoke Tests**
   ```bash
   # Homepage loads
   curl -I https://foodbook.psinfoodservice.com/

   # Product search works
   curl -X POST https://foodbook.psinfoodservice.com/api/search \
     -H "Content-Type: application/json" \
     -d '{"keyword":"test","locale":"nl"}'
   ```

3. **Monitor Errors**
   - Check Sentry dashboard for errors
   - Monitor logs for 30 minutes
   - Check resource usage (CPU, memory)

4. **Update Status**
   - Mark deployment as successful in incident log
   - Update status page
   - Send completion notification

---

## CI/CD Automated Deployment

### GitHub Actions Workflow

The application includes GitHub Actions workflows for automated deployment.

#### CI Workflow

Runs on all pull requests and pushes:

**File**: `.github/workflows/ci.yml`

**Steps**:
1. Lint and type check
2. Run unit tests with coverage
3. Run E2E tests
4. Build application

#### Deploy Workflow

Runs on push to `master` branch:

**File**: `.github/workflows/deploy.yml`

**Steps**:
1. Run all CI checks
2. Build Docker image
3. Tag image with commit SHA
4. Push to container registry
5. Deploy to production (placeholder)

#### Setting Up Automated Deployment

1. **Configure GitHub Secrets**

Navigate to repository Settings → Secrets and add:

```
DOCKERHUB_USERNAME    # Docker Hub username
DOCKERHUB_TOKEN       # Docker Hub access token
PRODUCTION_SSH_KEY    # SSH key for production server
PRODUCTION_HOST       # Production server hostname
PRODUCTION_USER       # SSH username
```

2. **Enable Docker Push**

Uncomment the Docker Hub push steps in `.github/workflows/deploy.yml`:

```yaml
- name: Login to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

- name: Push to Docker Hub
  run: |
    docker tag ps-foodbook-app:latest ${{ secrets.DOCKERHUB_USERNAME }}/ps-foodbook-app:latest
    docker tag ps-foodbook-app:latest ${{ secrets.DOCKERHUB_USERNAME }}/ps-foodbook-app:${{ github.sha }}
    docker push ${{ secrets.DOCKERHUB_USERNAME }}/ps-foodbook-app:latest
    docker push ${{ secrets.DOCKERHUB_USERNAME }}/ps-foodbook-app:${{ github.sha }}
```

3. **Add Deployment Step**

Add deployment to production server:

```yaml
- name: Deploy to production
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.PRODUCTION_HOST }}
    username: ${{ secrets.PRODUCTION_USER }}
    key: ${{ secrets.PRODUCTION_SSH_KEY }}
    script: |
      cd /opt/ps-foodbook
      docker-compose pull
      docker-compose up -d
      docker system prune -f
```

#### Manual Trigger

Deploy manually via GitHub Actions:

```bash
# Navigate to Actions tab in GitHub
# Select "Deploy to Production" workflow
# Click "Run workflow" button
# Select branch and confirm
```

---

## Post-Deployment Verification

### Automated Verification Script

Create `verify-deployment.sh`:

```bash
#!/bin/bash

BASE_URL="${1:-http://localhost:3000}"
ERRORS=0

echo "Verifying deployment at $BASE_URL"

# Test 1: Health check
echo -n "Testing health endpoint... "
HEALTH=$(curl -s "$BASE_URL/api/health")
STATUS=$(echo $HEALTH | jq -r '.status')

if [ "$STATUS" == "ok" ]; then
  echo "✓ PASS"
else
  echo "✗ FAIL"
  ERRORS=$((ERRORS + 1))
fi

# Test 2: Homepage
echo -n "Testing homepage... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")

if [ "$HTTP_CODE" == "200" ]; then
  echo "✓ PASS"
else
  echo "✗ FAIL (HTTP $HTTP_CODE)"
  ERRORS=$((ERRORS + 1))
fi

# Test 3: Search API
echo -n "Testing search API... "
SEARCH_RESULT=$(curl -s -X POST "$BASE_URL/api/search" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"test","locale":"nl"}')

if echo "$SEARCH_RESULT" | jq -e '.products' > /dev/null 2>&1; then
  echo "✓ PASS"
else
  echo "✗ FAIL"
  ERRORS=$((ERRORS + 1))
fi

# Test 4: Static assets
echo -n "Testing static assets... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/_next/static/")

if [ "$HTTP_CODE" == "404" ] || [ "$HTTP_CODE" == "200" ]; then
  echo "✓ PASS"
else
  echo "✗ FAIL (HTTP $HTTP_CODE)"
  ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✓ All tests passed"
  exit 0
else
  echo "✗ $ERRORS test(s) failed"
  exit 1
fi
```

Run verification:

```bash
chmod +x verify-deployment.sh
./verify-deployment.sh https://foodbook.psinfoodservice.com
```

### Manual Verification Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Homepage loads within 2 seconds
- [ ] Product search returns results
- [ ] Autocomplete suggestions work
- [ ] Images load correctly
- [ ] Multi-language switching works
- [ ] No JavaScript errors in console
- [ ] No 404 errors for static assets
- [ ] Monitoring dashboard shows no errors
- [ ] Response times are acceptable (< 500ms)
- [ ] Memory usage is stable (< 1.5GB)
- [ ] CPU usage is reasonable (< 50%)

### Monitoring After Deployment

Monitor for the first 30 minutes:

```bash
# Watch logs in real-time
docker logs -f ps-foodbook-app

# Monitor resource usage
watch -n 5 'docker stats --no-stream ps-foodbook-app'

# Check error count
docker logs --since 30m ps-foodbook-app | grep -i error | wc -l

# Monitor health check
watch -n 10 'curl -s http://localhost:3000/api/health | jq'
```

---

## Rollback Procedures

### When to Rollback

Rollback immediately if:
- Health check consistently failing (> 3 failures)
- Error rate > 5%
- Critical functionality broken (search, product details)
- Performance degradation (response time > 5s)
- Memory/CPU issues causing instability

### Quick Rollback (Docker Compose)

```bash
# Stop current version
docker-compose down

# Restore previous version
docker tag ps-foodbook-app:backup-previous ps-foodbook-app:latest

# Start previous version
docker-compose up -d

# Verify rollback
curl http://localhost:3000/api/health
docker logs -f ps-foodbook-app
```

**Expected Time**: 30-60 seconds

### Quick Rollback (Direct Docker)

```bash
# Stop current container
docker stop ps-foodbook-app

# Remove current container
docker rm ps-foodbook-app

# Run previous version
docker run -d \
  --name ps-foodbook-app \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  ps-foodbook-app:backup-$(date -d "yesterday" +%Y%m%d)

# Verify
curl http://localhost:3000/api/health
```

### Rollback with Image Pull

If using container registry:

```bash
# Pull previous version
docker pull ps-foodbook-app:v0.9.0

# Tag as latest
docker tag ps-foodbook-app:v0.9.0 ps-foodbook-app:latest

# Restart with new tag
docker-compose down
docker-compose up -d
```

### Kubernetes Rollback

```bash
# Rollback to previous revision
kubectl rollout undo deployment/ps-foodbook-app -n ps-foodbook

# Check rollback status
kubectl rollout status deployment/ps-foodbook-app -n ps-foodbook

# View rollout history
kubectl rollout history deployment/ps-foodbook-app -n ps-foodbook
```

### Post-Rollback Actions

1. **Verify Service Restored**
   ```bash
   ./verify-deployment.sh https://foodbook.psinfoodservice.com
   ```

2. **Notify Stakeholders**
   - Update status page
   - Send rollback notification
   - Explain reason for rollback

3. **Investigate Failure**
   - Collect logs from failed deployment
   - Review error patterns in Sentry
   - Document root cause

4. **Plan Fix**
   - Create hotfix branch
   - Test thoroughly in staging
   - Schedule new deployment

---

## Zero-Downtime Deployment

### Blue-Green Deployment Strategy

Blue-green deployment allows zero-downtime updates by running two identical environments.

#### Architecture

```
Load Balancer (Nginx)
├─ Blue Environment (Current: v1.0.0)  ← Active traffic
└─ Green Environment (New: v1.1.0)     ← Idle
```

#### Step-by-Step Process

**Step 1: Prepare Green Environment**

```bash
# Build new version
docker build -t ps-foodbook-app:v1.1.0 .

# Run green container on different port
docker run -d \
  --name ps-foodbook-app-green \
  -p 3001:3000 \
  --env-file .env.production \
  ps-foodbook-app:v1.1.0

# Verify green is healthy
curl http://localhost:3001/api/health
```

**Step 2: Test Green Environment**

```bash
# Run smoke tests against green
./verify-deployment.sh http://localhost:3001

# Manual testing
# Visit http://localhost:3001 in browser
```

**Step 3: Switch Traffic** (Nginx)

Update nginx configuration:

```nginx
upstream ps_foodbook {
    # Old: server localhost:3000;  # Blue (old)
    server localhost:3001;  # Green (new)
}
```

Reload nginx:

```bash
sudo nginx -t  # Test configuration
sudo nginx -s reload  # Reload without downtime
```

**Step 4: Monitor Green**

```bash
# Monitor logs
docker logs -f ps-foodbook-app-green

# Monitor metrics
docker stats ps-foodbook-app-green

# Check error rate in Sentry
```

**Step 5: Decommission Blue**

After confirming green is stable (15-30 minutes):

```bash
# Stop blue container
docker stop ps-foodbook-app

# Keep blue for 24 hours as backup
# Remove after confirming stability
docker rm ps-foodbook-app
```

**Step 6: Prepare for Next Deployment**

```bash
# Rename green to blue
docker rename ps-foodbook-app-green ps-foodbook-app

# Update nginx to use port 3000
# Edit nginx config: server localhost:3000;
sudo nginx -s reload
```

#### Automated Blue-Green Script

Create `blue-green-deploy.sh`:

```bash
#!/bin/bash

NEW_VERSION=$1
BLUE_PORT=3000
GREEN_PORT=3001

if [ -z "$NEW_VERSION" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

echo "Starting blue-green deployment for version $NEW_VERSION"

# Step 1: Build green
echo "Building green environment..."
docker build -t ps-foodbook-app:$NEW_VERSION .

# Step 2: Start green
echo "Starting green container..."
docker run -d \
  --name ps-foodbook-app-green \
  -p $GREEN_PORT:3000 \
  --env-file .env.production \
  ps-foodbook-app:$NEW_VERSION

# Step 3: Wait for green to be healthy
echo "Waiting for green to be healthy..."
for i in {1..30}; do
  if curl -sf http://localhost:$GREEN_PORT/api/health > /dev/null; then
    echo "Green is healthy"
    break
  fi
  sleep 2
done

# Step 4: Run tests on green
echo "Testing green environment..."
if ! ./verify-deployment.sh http://localhost:$GREEN_PORT; then
  echo "Tests failed. Stopping green."
  docker stop ps-foodbook-app-green
  docker rm ps-foodbook-app-green
  exit 1
fi

# Step 5: Switch nginx
echo "Switching traffic to green..."
sed -i "s/localhost:$BLUE_PORT/localhost:$GREEN_PORT/" /etc/nginx/sites-enabled/ps-foodbook
sudo nginx -s reload

# Step 6: Monitor green
echo "Monitoring green for 5 minutes..."
sleep 300

# Step 7: Check for errors
ERROR_COUNT=$(docker logs --since 5m ps-foodbook-app-green | grep -i error | wc -l)
if [ $ERROR_COUNT -gt 10 ]; then
  echo "Too many errors detected. Rolling back."
  sed -i "s/localhost:$GREEN_PORT/localhost:$BLUE_PORT/" /etc/nginx/sites-enabled/ps-foodbook
  sudo nginx -s reload
  docker stop ps-foodbook-app-green
  exit 1
fi

# Step 8: Decommission blue
echo "Stopping blue container..."
docker stop ps-foodbook-app
docker rm ps-foodbook-app

# Step 9: Rename green to blue
docker rename ps-foodbook-app-green ps-foodbook-app

echo "Deployment complete!"
```

---

## Troubleshooting

### Container Won't Start

**Symptom**: Container exits immediately after `docker-compose up`

**Diagnosis**:
```bash
docker logs ps-foodbook-app
docker inspect ps-foodbook-app
```

**Common Causes**:
1. Missing environment variables
2. Port 3000 already in use
3. Invalid configuration

**Solution**:
```bash
# Check environment
docker exec ps-foodbook-app env | grep NEXT_PUBLIC

# Check port usage
lsof -i :3000

# Restart with clean state
docker-compose down -v
docker-compose up -d
```

### Health Check Failing

**Symptom**: Container marked as unhealthy

**Diagnosis**:
```bash
curl -v http://localhost:3000/api/health
docker inspect --format='{{json .State.Health}}' ps-foodbook-app | jq
```

**Common Causes**:
1. Backend API unreachable
2. Slow startup (increase `start_period` in health check)
3. Memory issues

**Solution**:
```bash
# Test backend API
curl -I $FOODBOOK_API_URL

# Increase startup time in docker-compose.yml
healthcheck:
  start_period: 60s  # Increase from 40s

# Restart
docker-compose restart
```

### Deployment Fails in CI/CD

**Symptom**: GitHub Actions workflow fails

**Diagnosis**:
- Check workflow logs in GitHub Actions tab
- Review failed step output

**Common Causes**:
1. Tests failing
2. Build errors
3. Missing secrets

**Solution**:
```bash
# Run tests locally
npm test -- --run
npm run type-check
npm run lint

# Check build
npm run build

# Verify secrets are configured in GitHub
# Settings → Secrets → Actions
```

### Slow Performance After Deployment

**Symptom**: Response times > 2 seconds

**Diagnosis**:
```bash
# Check resource usage
docker stats ps-foodbook-app

# Check backend API performance
time curl $FOODBOOK_API_URL/api/products

# Check logs for errors
docker logs ps-foodbook-app | grep -i "timeout\|slow\|error"
```

**Solution**:
1. Increase cache times (CACHE_REVALIDATE)
2. Scale horizontally (add more containers)
3. Check backend API performance
4. Review and optimize database queries

---

## Summary

### Deployment Quick Reference

```bash
# Standard deployment
git checkout v1.0.0
docker-compose build
docker-compose down
docker-compose up -d
./verify-deployment.sh

# Rollback
docker-compose down
docker tag ps-foodbook-app:backup-previous ps-foodbook-app:latest
docker-compose up -d

# Blue-green deployment
./blue-green-deploy.sh v1.0.0
```

### Key Principles

1. **Test First**: Always test in staging before production
2. **Backup**: Always backup before deployment
3. **Monitor**: Watch logs and metrics for 30 minutes post-deployment
4. **Communicate**: Keep stakeholders informed
5. **Document**: Record all deployments in incident log

### Emergency Contacts

- **On-Call Engineer**: oncall@psinfoodservice.com
- **DevOps Team**: devops@psinfoodservice.com
- **Escalation**: See RUNBOOK.md

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-27
**Maintained By**: PS in Foodservice DevOps Team
