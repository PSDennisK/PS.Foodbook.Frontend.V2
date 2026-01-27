# Operations Runbook - PS Foodbook App

## Document Information

- **Last Updated**: 2026-01-27
- **Application**: PS Foodbook Frontend
- **Version**: 1.0.0
- **Maintainer**: PS in Foodservice DevOps Team

## Table of Contents

1. [Application Overview](#application-overview)
2. [System Requirements](#system-requirements)
3. [Startup and Shutdown](#startup-and-shutdown)
4. [Monitoring](#monitoring)
5. [Troubleshooting](#troubleshooting)
6. [Log Management](#log-management)
7. [Backup and Recovery](#backup-and-recovery)
8. [Performance Management](#performance-management)
9. [Security Operations](#security-operations)
10. [Incident Response](#incident-response)
11. [Maintenance Procedures](#maintenance-procedures)
12. [Contact Information](#contact-information)

---

## Application Overview

### Description

PS Foodbook is a Next.js 15 application providing a multi-language product catalog for PS in Foodservice. The application serves product information, digital catalogs, and product sheets with PDF generation capabilities.

### Technology Stack

- **Runtime**: Node.js 18 (Alpine Linux)
- **Framework**: Next.js 15 (Standalone mode)
- **Deployment**: Docker containers
- **Reverse Proxy**: Nginx (recommended)
- **Monitoring**: Sentry, Google Tag Manager

### Architecture

```
Internet → Reverse Proxy (Nginx) → Docker Container → Node.js Server
                                                     ↓
                                              Backend API
```

### Key Components

1. **Web Server**: Next.js standalone server (port 3000)
2. **Health Check**: `/api/health` endpoint
3. **Client Logging**: `/api/log` endpoint
4. **Static Assets**: `.next/static` directory
5. **Server Components**: React Server Components

---

## System Requirements

### Minimum Requirements

| Component | Specification |
|-----------|--------------|
| CPU | 2 cores |
| RAM | 2 GB |
| Disk | 10 GB |
| Network | 100 Mbps |

### Recommended Requirements

| Component | Specification |
|-----------|--------------|
| CPU | 4 cores |
| RAM | 4 GB |
| Disk | 20 GB SSD |
| Network | 1 Gbps |

### Dependencies

- **Docker**: 20.10+ or Docker Compose 2.0+
- **Backend API**: FOODBOOK_API_URL must be accessible
- **Ports**: 3000 (container internal), 80/443 (reverse proxy)

### Environment Variables

Required variables (see `.env.production.example`):

```bash
# Critical
NEXT_PUBLIC_APP_ENV=production
FOODBOOK_API_URL=https://api.psinfoodservice.com
JWT_SECRET=<secure-secret-min-32-chars>
PERMALINK_SECRET=<secure-secret>

# Important
COOKIE_DOMAIN=.psinfoodservice.com
SESSION_DURATION=86400
CACHE_REVALIDATE=300
```

---

## Startup and Shutdown

### Starting the Application

#### Using Docker Compose (Recommended)

```bash
# Start in foreground
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

#### Using Docker Directly

```bash
# Pull latest image
docker pull ps-foodbook-app:latest

# Run container
docker run -d \
  --name ps-foodbook-app \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  ps-foodbook-app:latest

# Check logs
docker logs -f ps-foodbook-app
```

### Verification After Startup

1. **Health Check**
```bash
curl http://localhost:3000/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-27T12:00:00Z",
  "environment": "production",
  "version": "1.0.0"
}
```

2. **Homepage Load**
```bash
curl -I http://localhost:3000/
```
Expected: HTTP 200 OK

3. **Container Status**
```bash
docker ps | grep ps-foodbook-app
```
Expected: Status "Up" with healthy

### Stopping the Application

#### Graceful Shutdown (Recommended)

```bash
# Docker Compose
docker-compose stop

# Docker
docker stop ps-foodbook-app
```

**Wait Time**: Allow 10-15 seconds for graceful shutdown

#### Force Stop (Emergency Only)

```bash
# Docker Compose
docker-compose kill

# Docker
docker kill ps-foodbook-app
```

### Restarting the Application

```bash
# Docker Compose
docker-compose restart

# Docker
docker restart ps-foodbook-app
```

---

## Monitoring

### Health Checks

#### Application Health

**Endpoint**: `GET /api/health`

**Check Frequency**: Every 30 seconds (configured in docker-compose.yml)

**Healthy Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-27T12:00:00Z",
  "environment": "production",
  "version": "1.0.0"
}
```

#### Container Health

```bash
# Check Docker health status
docker inspect --format='{{.State.Health.Status}}' ps-foodbook-app

# View health check history
docker inspect --format='{{json .State.Health}}' ps-foodbook-app | jq
```

### Key Metrics to Monitor

1. **Response Time**
   - Target: < 500ms for homepage
   - Critical: > 2000ms

2. **Error Rate**
   - Target: < 0.1%
   - Critical: > 1%

3. **Memory Usage**
   - Target: < 1.5 GB
   - Critical: > 3 GB

4. **CPU Usage**
   - Target: < 50%
   - Critical: > 80%

5. **Container Restarts**
   - Target: 0 in 24h
   - Critical: > 3 in 1h

### Monitoring Commands

```bash
# Container resource usage
docker stats ps-foodbook-app

# Real-time logs
docker logs -f --tail 100 ps-foodbook-app

# Container processes
docker top ps-foodbook-app

# Disk usage
docker system df

# Check container uptime
docker inspect -f '{{.State.StartedAt}}' ps-foodbook-app
```

### Sentry Monitoring

**Dashboard**: https://sentry.io/organizations/your-org/projects/ps-foodbook/

**Alerts**:
- Error rate > 1%
- Response time > 2s
- Memory usage > 80%

**Key Metrics**:
- Total errors
- Affected users
- Performance issues
- Release health

---

## Troubleshooting

### Common Issues

#### Issue 1: Container Won't Start

**Symptoms**:
- Container exits immediately
- `docker ps` doesn't show running container

**Diagnosis**:
```bash
# Check container logs
docker logs ps-foodbook-app

# Check container exit code
docker inspect --format='{{.State.ExitCode}}' ps-foodbook-app
```

**Common Causes**:
1. Missing environment variables
2. Port 3000 already in use
3. Invalid configuration

**Resolution**:
```bash
# Check environment variables
docker exec ps-foodbook-app env | grep NEXT_PUBLIC

# Check port usage
netstat -tulpn | grep 3000

# Restart with clean state
docker-compose down
docker-compose up -d
```

#### Issue 2: Health Check Failing

**Symptoms**:
- `/api/health` returns 500 or times out
- Container marked as unhealthy

**Diagnosis**:
```bash
# Test health endpoint
curl -v http://localhost:3000/api/health

# Check container logs
docker logs --tail 50 ps-foodbook-app
```

**Common Causes**:
1. Backend API unreachable
2. Database connection issues
3. Memory exhaustion

**Resolution**:
```bash
# Test backend API connectivity
docker exec ps-foodbook-app curl -I $FOODBOOK_API_URL

# Check memory usage
docker stats --no-stream ps-foodbook-app

# Restart container
docker restart ps-foodbook-app
```

#### Issue 3: High Memory Usage

**Symptoms**:
- Memory usage > 3 GB
- Container becoming unresponsive
- OOM (Out of Memory) errors

**Diagnosis**:
```bash
# Check memory usage
docker stats --no-stream ps-foodbook-app

# Check for memory leaks in logs
docker logs ps-foodbook-app | grep -i "memory"
```

**Resolution**:
```bash
# Restart container (temporary fix)
docker restart ps-foodbook-app

# Set memory limits (permanent fix)
# Edit docker-compose.yml:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

#### Issue 4: Slow Response Times

**Symptoms**:
- Pages loading > 2 seconds
- API calls timing out

**Diagnosis**:
```bash
# Test response time
time curl -o /dev/null -s -w '%{time_total}\n' http://localhost:3000/

# Check backend API latency
time curl -o /dev/null -s -w '%{time_total}\n' $FOODBOOK_API_URL/api/endpoint

# Check CPU usage
docker stats --no-stream ps-foodbook-app
```

**Resolution**:
1. Check backend API performance
2. Verify cache configuration (CACHE_REVALIDATE)
3. Scale horizontally (add more containers)
4. Check for network issues

#### Issue 5: 404 Errors on Static Assets

**Symptoms**:
- Images not loading
- CSS/JS files not found
- Console errors for missing assets

**Diagnosis**:
```bash
# Check static files exist
docker exec ps-foodbook-app ls -la /app/.next/static

# Test static asset
curl -I http://localhost:3000/_next/static/...
```

**Resolution**:
```bash
# Rebuild and redeploy
docker-compose down
docker-compose up --build -d
```

### Emergency Procedures

#### Complete Service Outage

1. **Immediate Actions** (0-5 minutes):
   ```bash
   # Check container status
   docker ps -a | grep ps-foodbook-app

   # Attempt quick restart
   docker restart ps-foodbook-app

   # Monitor logs
   docker logs -f ps-foodbook-app
   ```

2. **Escalation** (5-15 minutes):
   - Alert on-call engineer
   - Check monitoring dashboards (Sentry)
   - Review recent deployments

3. **Rollback** (if recent deployment):
   ```bash
   # Deploy previous version
   docker pull ps-foodbook-app:previous-version
   docker-compose down
   docker-compose up -d
   ```

4. **Communication**:
   - Update status page
   - Notify stakeholders
   - Document incident

---

## Log Management

### Log Locations

#### Container Logs

```bash
# View all logs
docker logs ps-foodbook-app

# View last 100 lines
docker logs --tail 100 ps-foodbook-app

# Follow logs in real-time
docker logs -f ps-foodbook-app

# View logs with timestamps
docker logs -t ps-foodbook-app

# Filter logs by time
docker logs --since 30m ps-foodbook-app
docker logs --until 2h ps-foodbook-app
```

#### Application Logs

Logs are written to stdout/stderr and captured by Docker.

**Log Levels**:
- `production`: INFO and above
- `staging`: DEBUG and above
- `development`: ALL

### Log Formats

#### Server Logs
```
[2026-01-27T12:00:00Z] INFO Server started on port 3000
[2026-01-27T12:00:01Z] INFO Environment: production
```

#### API Logs
```
[2026-01-27T12:00:05Z] INFO GET /api/health 200 12ms
[2026-01-27T12:00:06Z] ERROR GET /api/products 500 1243ms
```

#### Client Logs
```
[2026-01-27T12:00:10Z] INFO [CLIENT] User action: search
[2026-01-27T12:00:11Z] ERROR [CLIENT] API call failed: timeout
```

### Log Retention

- **Docker Logs**: Rotated at 10MB, keep 3 files
- **Configure in docker-compose.yml**:

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Log Analysis

#### Search for Errors

```bash
# Find all errors in last hour
docker logs --since 1h ps-foodbook-app | grep ERROR

# Count errors
docker logs --since 1h ps-foodbook-app | grep -c ERROR

# Find specific error pattern
docker logs ps-foodbook-app | grep "API call failed"
```

#### Monitor Specific Endpoints

```bash
# Watch health check logs
docker logs -f ps-foodbook-app | grep "/api/health"

# Watch API calls
docker logs -f ps-foodbook-app | grep "GET\|POST"
```

#### Export Logs

```bash
# Export to file
docker logs ps-foodbook-app > app-logs-$(date +%Y%m%d).log

# Export with timestamps
docker logs -t ps-foodbook-app > app-logs-with-timestamps.log

# Export last 24 hours
docker logs --since 24h ps-foodbook-app > app-logs-24h.log
```

---

## Backup and Recovery

### What to Back Up

1. **Environment Configuration**
   - `.env.production`
   - `docker-compose.yml`
   - Configuration files

2. **Docker Images**
   - Latest production image
   - Previous stable versions

3. **Documentation**
   - This runbook
   - Deployment guides
   - API documentation

### Backup Procedures

#### Environment Configuration

```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup environment file (without sensitive data)
grep -v "SECRET\|PASSWORD" .env.production > backups/$(date +%Y%m%d)/env-backup.txt

# Backup docker-compose
cp docker-compose.yml backups/$(date +%Y%m%d)/

# Create backup archive
tar -czf backups/config-backup-$(date +%Y%m%d).tar.gz backups/$(date +%Y%m%d)/
```

#### Docker Images

```bash
# Save Docker image
docker save ps-foodbook-app:latest | gzip > ps-foodbook-app-backup-$(date +%Y%m%d).tar.gz

# Tag current version before new deployment
docker tag ps-foodbook-app:latest ps-foodbook-app:backup-$(date +%Y%m%d)
```

### Recovery Procedures

#### Restore from Backup

```bash
# Load Docker image
docker load < ps-foodbook-app-backup-20260127.tar.gz

# Restore configuration
tar -xzf config-backup-20260127.tar.gz
cp backups/20260127/.env.production .
cp backups/20260127/docker-compose.yml .

# Start services
docker-compose up -d
```

#### Rollback to Previous Version

```bash
# Stop current version
docker-compose down

# Deploy previous version
docker tag ps-foodbook-app:backup-20260126 ps-foodbook-app:latest
docker-compose up -d

# Verify
curl http://localhost:3000/api/health
```

### Disaster Recovery

#### Complete System Recovery

1. **Prerequisites**:
   - Access to Docker image registry
   - Access to configuration backups
   - Clean server with Docker installed

2. **Recovery Steps**:

```bash
# Step 1: Install Docker
curl -fsSL https://get.docker.com | sh

# Step 2: Restore configuration
scp backup-server:/backups/config-backup-latest.tar.gz .
tar -xzf config-backup-latest.tar.gz

# Step 3: Pull Docker image
docker pull ps-foodbook-app:latest

# Step 4: Start services
docker-compose up -d

# Step 5: Verify
curl http://localhost:3000/api/health
docker logs -f ps-foodbook-app
```

3. **Verification Checklist**:
   - [ ] Health check returns 200
   - [ ] Homepage loads correctly
   - [ ] Product search works
   - [ ] Backend API connection established
   - [ ] Monitoring alerts configured

---

## Performance Management

### Performance Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Page Load Time | < 1s | > 2s | > 5s |
| API Response Time | < 200ms | > 500ms | > 2s |
| CPU Usage | < 30% | > 60% | > 80% |
| Memory Usage | < 1GB | > 2GB | > 3GB |
| Error Rate | < 0.1% | > 0.5% | > 1% |

### Performance Monitoring

```bash
# Real-time resource monitoring
docker stats ps-foodbook-app

# CPU and memory over time
watch -n 5 'docker stats --no-stream ps-foodbook-app'

# Network statistics
docker inspect ps-foodbook-app | jq '.[0].NetworkSettings'
```

### Performance Optimization

#### Cache Configuration

Adjust cache times based on performance needs:

```bash
# More aggressive caching (better performance, less fresh data)
CACHE_REVALIDATE=600
CACHE_STALE_WHILE_REVALIDATE=1200

# Less caching (more fresh data, higher load)
CACHE_REVALIDATE=60
CACHE_STALE_WHILE_REVALIDATE=120
```

#### Resource Limits

Set appropriate limits in `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

#### Scaling

Horizontal scaling with multiple containers:

```yaml
services:
  app:
    deploy:
      replicas: 3
```

Add load balancer (Nginx) configuration:

```nginx
upstream ps_foodbook {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}
```

### Performance Troubleshooting

#### Identify Slow Endpoints

```bash
# Monitor response times in logs
docker logs ps-foodbook-app | grep "GET\|POST" | awk '{print $NF}' | sort -n

# Check Sentry performance monitoring
# Navigate to Sentry dashboard → Performance
```

#### Database Query Performance

```bash
# Check backend API performance
time curl $FOODBOOK_API_URL/api/products

# Monitor API timeout errors
docker logs ps-foodbook-app | grep "timeout"
```

---

## Security Operations

### Security Checklist

- [ ] Environment variables use secure secrets (min 32 characters)
- [ ] JWT_SECRET is unique and not default value
- [ ] PERMALINK_SECRET is unique and not default value
- [ ] HTTPS is enforced via reverse proxy
- [ ] Security headers are configured
- [ ] Container runs as non-root user (nextjs:1001)
- [ ] Docker image is up to date
- [ ] Dependencies are updated (npm audit)
- [ ] Sentry monitoring is active
- [ ] Access logs are reviewed regularly

### Security Monitoring

#### Check for Security Issues

```bash
# Review npm vulnerabilities
docker exec ps-foodbook-app npm audit

# Check for exposed secrets in logs
docker logs ps-foodbook-app | grep -i "secret\|password\|token"

# Review access patterns
docker logs ps-foodbook-app | grep "POST /api"
```

#### Security Headers

Verify security headers in nginx configuration:

```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

Test headers:

```bash
curl -I https://foodbook.psinfoodservice.com | grep -i "x-frame-options\|x-content-type"
```

### Security Incident Response

#### Suspected Security Breach

1. **Immediate Actions**:
   ```bash
   # Capture current state
   docker logs ps-foodbook-app > incident-logs-$(date +%Y%m%d-%H%M%S).log

   # Isolate container (if necessary)
   docker network disconnect bridge ps-foodbook-app
   ```

2. **Investigation**:
   - Review access logs
   - Check Sentry for suspicious errors
   - Analyze network traffic
   - Review recent changes

3. **Remediation**:
   - Rotate secrets (JWT_SECRET, PERMALINK_SECRET)
   - Update environment variables
   - Rebuild and redeploy container
   - Monitor for continued issues

4. **Post-Incident**:
   - Document findings
   - Update security procedures
   - Conduct team review
   - Implement preventive measures

### Secret Rotation

#### Rotate JWT Secret

```bash
# Step 1: Generate new secret (min 32 chars)
NEW_JWT_SECRET=$(openssl rand -base64 32)

# Step 2: Update .env.production
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/" .env.production

# Step 3: Restart container
docker-compose restart

# Step 4: Verify
curl http://localhost:3000/api/health
```

**Note**: Rotating JWT_SECRET will invalidate all existing sessions.

---

## Incident Response

### Incident Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **P1 - Critical** | Complete service outage | 15 minutes | Site down, database offline |
| **P2 - High** | Major functionality broken | 1 hour | Search broken, images not loading |
| **P3 - Medium** | Degraded performance | 4 hours | Slow response times, intermittent errors |
| **P4 - Low** | Minor issues | 1 business day | UI glitches, cosmetic issues |

### Incident Response Procedures

#### P1 - Critical Incident

**Example**: Website completely down

1. **Alert** (0-5 min):
   ```bash
   # Verify issue
   curl http://localhost:3000/api/health

   # Check container status
   docker ps | grep ps-foodbook-app
   ```

2. **Communicate** (5-10 min):
   - Alert on-call team
   - Post status update: "We are investigating an issue"
   - Start incident log

3. **Diagnose** (10-20 min):
   ```bash
   # Check logs
   docker logs --tail 200 ps-foodbook-app

   # Check resources
   docker stats --no-stream ps-foodbook-app

   # Check backend API
   curl $FOODBOOK_API_URL/api/health
   ```

4. **Resolve** (20-30 min):
   - Apply fix (restart, rollback, or hotfix)
   - Verify resolution
   - Monitor for stability

5. **Post-Incident**:
   - Update status: "Issue resolved"
   - Document root cause
   - Schedule post-mortem

#### P2 - High Priority Incident

**Example**: Product search not working

1. **Verify** (0-15 min):
   - Reproduce issue
   - Check logs for errors
   - Determine scope (all users or subset)

2. **Diagnose** (15-45 min):
   - Review recent deployments
   - Check backend API responses
   - Analyze error patterns

3. **Resolve** (45-60 min):
   - Apply fix
   - Test fix in staging
   - Deploy to production
   - Monitor

### Incident Communication Template

```
Subject: [INCIDENT] PS Foodbook - <Brief Description>

Severity: P1/P2/P3/P4
Status: INVESTIGATING / IDENTIFIED / MONITORING / RESOLVED
Started: 2026-01-27 12:00 UTC
Impact: <Description of user impact>

Current Status:
<What we know and what we're doing>

Next Update: In 30 minutes or when status changes

Incident Commander: <Name>
```

### Post-Incident Review

After resolving a P1 or P2 incident:

1. **Schedule Post-Mortem** (within 48 hours)
2. **Document**:
   - Timeline of events
   - Root cause analysis
   - Actions taken
   - Resolution time
3. **Action Items**:
   - What can prevent this in future?
   - What can improve detection?
   - What can improve response?

---

## Maintenance Procedures

### Regular Maintenance Tasks

#### Daily

```bash
# Check health status
curl http://localhost:3000/api/health

# Review error logs
docker logs --since 24h ps-foodbook-app | grep ERROR

# Check resource usage
docker stats --no-stream ps-foodbook-app
```

#### Weekly

```bash
# Review Sentry dashboard for trends
# Check for security vulnerabilities
docker exec ps-foodbook-app npm audit

# Verify backups exist
ls -lh backups/

# Review performance metrics
# Check disk space
df -h
```

#### Monthly

```bash
# Update dependencies (in staging first)
docker exec ps-foodbook-app npm outdated

# Rotate logs
docker-compose restart

# Review and update documentation
# Conduct security review
# Test disaster recovery procedures
```

### Planned Maintenance

#### Maintenance Window

**Recommended Window**: Sundays 02:00-04:00 UTC

**Notification**: Notify users 48 hours in advance

#### Maintenance Procedure

1. **Pre-Maintenance** (T-1 hour):
   ```bash
   # Backup current state
   docker save ps-foodbook-app:latest | gzip > backup-pre-maintenance.tar.gz

   # Verify backup
   docker load < backup-pre-maintenance.tar.gz

   # Notify users
   # Update status page
   ```

2. **During Maintenance**:
   ```bash
   # Apply updates
   docker-compose pull
   docker-compose down
   docker-compose up -d

   # Or deploy new version
   docker pull ps-foodbook-app:v1.1.0
   docker tag ps-foodbook-app:v1.1.0 ps-foodbook-app:latest
   docker-compose up -d
   ```

3. **Post-Maintenance**:
   ```bash
   # Verify health
   curl http://localhost:3000/api/health

   # Smoke tests
   curl http://localhost:3000/
   curl http://localhost:3000/product

   # Monitor logs
   docker logs -f --tail 100 ps-foodbook-app

   # Update status page
   # Send completion notification
   ```

### Updates and Upgrades

#### Application Updates

```bash
# Pull latest version
docker pull ps-foodbook-app:latest

# Stop current version
docker-compose down

# Start new version
docker-compose up -d

# Verify
curl http://localhost:3000/api/health
docker logs -f ps-foodbook-app
```

#### Rollback Procedure

```bash
# If update fails, rollback to previous version
docker-compose down
docker tag ps-foodbook-app:backup-previous ps-foodbook-app:latest
docker-compose up -d

# Verify rollback
curl http://localhost:3000/api/health
```

---

## Contact Information

### Support Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| **On-Call Engineer** | oncall@psinfoodservice.com | 24/7 |
| **DevOps Team** | devops@psinfoodservice.com | Mon-Fri 9-17 CET |
| **Product Owner** | product@psinfoodservice.com | Mon-Fri 9-17 CET |
| **Security Team** | security@psinfoodservice.com | Mon-Fri 9-17 CET |

### Escalation Path

1. **Level 1**: On-Call Engineer
2. **Level 2**: DevOps Team Lead
3. **Level 3**: CTO / Engineering Manager

### External Services

| Service | Purpose | Contact |
|---------|---------|---------|
| **Sentry** | Error Monitoring | https://sentry.io/support |
| **Docker Hub** | Image Registry | https://hub.docker.com/support |
| **Backend API** | Data Source | api-support@psinfoodservice.com |

### Useful Links

- **Monitoring Dashboard**: https://sentry.io/organizations/ps-foodservice/
- **Status Page**: https://status.psinfoodservice.com
- **Documentation**: https://docs.psinfoodservice.com
- **GitHub Repository**: <repository-url>
- **CI/CD Pipeline**: <github-actions-url>

---

## Appendix

### Useful Commands Quick Reference

```bash
# Health Check
curl http://localhost:3000/api/health

# Container Status
docker ps | grep ps-foodbook-app

# View Logs
docker logs -f --tail 100 ps-foodbook-app

# Resource Usage
docker stats --no-stream ps-foodbook-app

# Restart Container
docker restart ps-foodbook-app

# Stop Container
docker-compose down

# Start Container
docker-compose up -d

# Rebuild and Start
docker-compose up --build -d

# Execute Command in Container
docker exec -it ps-foodbook-app sh

# Export Logs
docker logs ps-foodbook-app > app-logs.txt
```

### Environment Variables Reference

See `.env.production.example` for complete list.

### Troubleshooting Decision Tree

```
Issue Detected
    ↓
Is health check responding?
    ├─ NO → Check if container is running
    │        ├─ NO → Start container
    │        └─ YES → Check logs for errors
    └─ YES → Is response time acceptable?
              ├─ NO → Check resource usage
              │        ├─ High CPU → Scale horizontally
              │        └─ High Memory → Restart or increase limits
              └─ YES → Check error rate
                        ├─ High → Check Sentry / Review logs
                        └─ Low → Monitor and document
```

---

**Document Version**: 1.0.0
**Last Review Date**: 2026-01-27
**Next Review Date**: 2026-04-27
**Owner**: PS in Foodservice DevOps Team
