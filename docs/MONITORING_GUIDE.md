# Monitoring Guide - PS Foodbook App

## Overview

This guide provides comprehensive instructions for monitoring, observability, and alerting for the PS Foodbook application. Effective monitoring enables proactive issue detection and rapid incident response.

**Monitoring Philosophy**: Observe, measure, alert, improve.

## Table of Contents

1. [Monitoring Architecture](#monitoring-architecture)
2. [Health Checks](#health-checks)
3. [Metrics and KPIs](#metrics-and-kpis)
4. [Logging](#logging)
5. [Error Tracking (Sentry)](#error-tracking-sentry)
6. [Performance Monitoring](#performance-monitoring)
7. [Alerting](#alerting)
8. [Dashboards](#dashboards)
9. [SLIs, SLOs, and SLAs](#slis-slos-and-slas)
10. [Troubleshooting with Monitoring](#troubleshooting-with-monitoring)

---

## Monitoring Architecture

### Monitoring Stack

```
Application
    ↓
Health Checks → Docker Health Check
    ↓
Logs → stdout/stderr → Docker Logs
    ↓
Errors → Sentry (Error Tracking)
    ↓
Metrics → Docker Stats / Prometheus (future)
    ↓
Alerts → Email / Slack / PagerDuty
    ↓
Dashboards → Grafana / Sentry
```

### Components

1. **Health Checks**: `/api/health` endpoint
2. **Application Logs**: stdout/stderr via Docker
3. **Client Logs**: `/api/log` endpoint → Sentry
4. **Error Tracking**: Sentry for exceptions and errors
5. **Container Metrics**: Docker stats (CPU, memory, network)
6. **APM**: Application Performance Monitoring via Sentry
7. **Analytics**: Google Tag Manager + Google Analytics (optional)

### Monitoring Layers

| Layer | Tool | Metrics |
|-------|------|---------|
| **Infrastructure** | Docker, System | CPU, Memory, Disk, Network |
| **Application** | Sentry, Logs | Errors, Performance, Traces |
| **User Experience** | Sentry, GA | Page load time, User flow |
| **Business** | Custom | Searches, Product views, Conversions |

---

## Health Checks

### Application Health Endpoint

**Endpoint**: `GET /api/health`

**Purpose**: Verify application is running and responsive

**Location**: `src/app/api/health/route.ts`

#### Response Format

```json
{
  "status": "ok",
  "timestamp": "2026-01-27T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

**Response Fields**:
- `status`: Health status ("ok" = healthy)
- `timestamp`: Current server time (ISO 8601)
- `environment`: Environment name (development, staging, production)
- `version`: Application version from package.json

#### Health Check Configuration

**Docker Compose** (`docker-compose.yml`):

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
  interval: 30s      # Check every 30 seconds
  timeout: 10s       # Timeout after 10 seconds
  retries: 3         # 3 failures = unhealthy
  start_period: 40s  # Wait 40s before first check
```

#### Manual Health Check

```bash
# Check health endpoint
curl -s http://localhost:3000/api/health | jq

# Expected output:
# {
#   "status": "ok",
#   "timestamp": "2026-01-27T12:00:00.000Z",
#   "environment": "production",
#   "version": "1.0.0"
# }

# Check Docker health status
docker inspect --format='{{.State.Health.Status}}' ps-foodbook-app
# Expected: healthy

# View health check history
docker inspect --format='{{json .State.Health}}' ps-foodbook-app | jq
```

### Automated Health Monitoring

#### Script: `monitor-health.sh`

```bash
#!/bin/bash

URL="${1:-http://localhost:3000}"
INTERVAL="${2:-30}"

echo "Monitoring health at $URL every ${INTERVAL}s"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  RESPONSE=$(curl -s -w "\n%{http_code}" "$URL/api/health")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" == "200" ]; then
    STATUS=$(echo "$BODY" | jq -r '.status')
    TIMESTAMP=$(echo "$BODY" | jq -r '.timestamp')
    echo "✓ [$(date +%H:%M:%S)] Healthy - $STATUS at $TIMESTAMP"
  else
    echo "✗ [$(date +%H:%M:%S)] Unhealthy - HTTP $HTTP_CODE"
  fi

  sleep $INTERVAL
done
```

Usage:
```bash
chmod +x monitor-health.sh
./monitor-health.sh https://foodbook.psinfoodservice.com 60
```

### Health Check Alerts

Configure alerts for health check failures:

```bash
# Using cron to check health every 5 minutes
*/5 * * * * /opt/scripts/check-health.sh || /opt/scripts/send-alert.sh "Health check failed"
```

---

## Metrics and KPIs

### Key Performance Indicators

#### Application Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **Uptime** | 99.9% | 99.5% | < 99% |
| **Response Time (P50)** | < 200ms | > 500ms | > 1s |
| **Response Time (P95)** | < 500ms | > 1s | > 2s |
| **Response Time (P99)** | < 1s | > 2s | > 5s |
| **Error Rate** | < 0.1% | > 0.5% | > 1% |
| **Apdex Score** | > 0.95 | < 0.90 | < 0.80 |

#### Infrastructure Metrics

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **CPU Usage** | < 30% | > 60% | > 80% |
| **Memory Usage** | < 1GB | > 1.5GB | > 2GB |
| **Disk Usage** | < 50% | > 70% | > 85% |
| **Network I/O** | < 10MB/s | > 50MB/s | > 100MB/s |

#### Business Metrics

| Metric | Description |
|--------|-------------|
| **Daily Active Users** | Unique users per day |
| **Product Searches** | Number of searches per day |
| **Product Views** | Product detail page views |
| **Search Success Rate** | % of searches with results |
| **Page Load Time** | Time to first meaningful paint |

### Collecting Metrics

#### Docker Stats

Real-time container metrics:

```bash
# Real-time stats
docker stats ps-foodbook-app

# Output:
# CONTAINER      CPU %    MEM USAGE / LIMIT   MEM %    NET I/O         BLOCK I/O
# ps-foodbook    2.45%    256MiB / 2GiB       12.5%    1.2MB / 800kB   0B / 0B

# One-time snapshot
docker stats --no-stream ps-foodbook-app

# JSON format for parsing
docker stats --no-stream --format "{{json .}}" ps-foodbook-app | jq
```

#### Metrics Collection Script

```bash
#!/bin/bash
# collect-metrics.sh

CONTAINER="ps-foodbook-app"
INTERVAL=60
LOGFILE="/var/log/ps-foodbook-metrics.log"

while true; do
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Collect Docker stats
  STATS=$(docker stats --no-stream --format "{{.CPUPerc}},{{.MemUsage}},{{.NetIO}}" $CONTAINER)

  # Parse stats
  CPU=$(echo $STATS | cut -d',' -f1)
  MEM=$(echo $STATS | cut -d',' -f2)
  NET=$(echo $STATS | cut -d',' -f3)

  # Log metrics
  echo "$TIMESTAMP,$CPU,$MEM,$NET" >> $LOGFILE

  sleep $INTERVAL
done
```

#### Prometheus Export (Future Enhancement)

For production-grade metrics:

```yaml
# docker-compose.yml
services:
  app:
    # ... existing config

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
```

---

## Logging

### Log Levels

| Level | Use Case | Example |
|-------|----------|---------|
| **DEBUG** | Development debugging | Function entry/exit, variable values |
| **INFO** | Normal operations | Server started, request completed |
| **WARN** | Potential issues | Deprecated API used, slow query |
| **ERROR** | Recoverable errors | API timeout, validation failed |
| **FATAL** | Critical failures | Database connection lost |

### Log Format

**Structured JSON logging**:

```json
{
  "timestamp": "2026-01-27T12:00:00.000Z",
  "level": "INFO",
  "message": "GET /api/search 200 15ms",
  "context": {
    "method": "GET",
    "path": "/api/search",
    "statusCode": 200,
    "duration": 15,
    "ip": "203.0.113.1"
  }
}
```

### Viewing Logs

#### Docker Logs

```bash
# View all logs
docker logs ps-foodbook-app

# Follow logs (real-time)
docker logs -f ps-foodbook-app

# Last 100 lines
docker logs --tail 100 ps-foodbook-app

# With timestamps
docker logs -t ps-foodbook-app

# Since timestamp
docker logs --since 2026-01-27T12:00:00 ps-foodbook-app

# Last 30 minutes
docker logs --since 30m ps-foodbook-app

# Until timestamp
docker logs --until 2026-01-27T13:00:00 ps-foodbook-app
```

#### Docker Compose Logs

```bash
# All services
docker-compose logs

# Follow all services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# With timestamps
docker-compose logs -t -f
```

### Log Filtering

```bash
# Filter by log level
docker logs ps-foodbook-app | grep ERROR

# Count errors
docker logs --since 1h ps-foodbook-app | grep -c ERROR

# Find specific pattern
docker logs ps-foodbook-app | grep "API call failed"

# Multiple patterns
docker logs ps-foodbook-app | grep -E "ERROR|WARN"

# Exclude patterns
docker logs ps-foodbook-app | grep -v "health"
```

### Log Aggregation

For production, aggregate logs to centralized system:

#### Option 1: ELK Stack (Elasticsearch, Logstash, Kibana)

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "gelf"
      options:
        gelf-address: "udp://localhost:12201"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    ports:
      - "12201:12201/udp"
```

#### Option 2: Fluentd

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: docker.ps-foodbook
```

### Log Rotation

Configure log rotation to prevent disk space issues:

```yaml
# docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"     # Rotate at 10MB
        max-file: "3"       # Keep 3 files
        compress: "true"    # Compress rotated logs
```

### Client-Side Logging

**Endpoint**: `POST /api/log`

**Usage**:
```javascript
import { logger } from '@/lib/utils/logger';

// Log errors
logger.error('API call failed', {
  endpoint: '/api/products',
  statusCode: 500,
  error: 'Timeout'
});

// Log info
logger.info('User action', {
  action: 'search',
  keyword: 'milk'
});
```

**Configuration**:
- Development: Logs to browser console
- Production: Sends to `/api/log` → forwarded to Sentry

---

## Error Tracking (Sentry)

### Sentry Setup

#### Installation

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### Configuration

**Environment Variables** (`.env.production`):

```bash
# Public DSN (exposed to browser)
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/789012

# Server DSN (server-side only)
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/789012

# Organization and project
SENTRY_ORG=ps-foodservice
SENTRY_PROJECT=ps-foodbook

# Auth token (for source maps upload)
SENTRY_AUTH_TOKEN=sntrys_your_auth_token_here
```

**Configuration Files**:

`sentry.client.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  tracesSampleRate: 0.1,  // 10% of transactions
  replaysSessionSampleRate: 0.1,  // 10% of sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of errors
});
```

`sentry.server.config.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  tracesSampleRate: 0.1,
});
```

### Using Sentry

#### Automatic Error Capture

Sentry automatically captures:
- Unhandled exceptions
- Unhandled promise rejections
- Console errors
- Network errors
- React errors

#### Manual Error Capture

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Code that might throw
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    level: 'error',
    tags: {
      operation: 'product-search',
    },
    contexts: {
      search: {
        keyword: 'milk',
        locale: 'nl',
      },
    },
  });
}
```

#### Custom Messages

```typescript
// Info message
Sentry.captureMessage('User completed checkout', {
  level: 'info',
  tags: { flow: 'checkout' },
});

// Warning
Sentry.captureMessage('API response slow', {
  level: 'warning',
  tags: { api: 'products' },
});
```

#### User Context

```typescript
// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Clear user context on logout
Sentry.setUser(null);
```

### Sentry Dashboard

**Access**: https://sentry.io/organizations/ps-foodservice/projects/ps-foodbook/

#### Key Sections

1. **Issues**:
   - View all errors
   - Group similar errors
   - Track error frequency
   - See stack traces

2. **Performance**:
   - Transaction overview
   - Slow endpoints
   - Database query performance
   - Web vitals

3. **Releases**:
   - Track deployments
   - Compare release health
   - Identify regressions

4. **Alerts**:
   - Configure alert rules
   - Set thresholds
   - Define notification channels

### Sentry Alerts

#### Error Rate Alert

```
Alert Name: High Error Rate
Condition: Error count is more than 100 in 1 hour
Actions: Send email to devops@psinfoodservice.com
```

#### Performance Alert

```
Alert Name: Slow Performance
Condition: P95 response time is above 2s for 5 minutes
Actions: Send Slack notification to #alerts
```

#### Issue Creation Alert

```
Alert Name: New Critical Issue
Condition: New issue is created with level: fatal
Actions: Create PagerDuty incident
```

### Release Tracking

Associate errors with releases:

```bash
# During deployment
export SENTRY_RELEASE=$(git rev-parse HEAD)

# Build with release info
npm run build

# Create release in Sentry
sentry-cli releases new $SENTRY_RELEASE
sentry-cli releases set-commits $SENTRY_RELEASE --auto
sentry-cli releases finalize $SENTRY_RELEASE

# Upload source maps
sentry-cli sourcemaps upload --release=$SENTRY_RELEASE .next
```

---

## Performance Monitoring

### Application Performance Monitoring (APM)

#### Sentry Performance

Automatically tracks:
- **Transactions**: Page loads, API calls
- **Spans**: Individual operations (database queries, HTTP requests)
- **Web Vitals**: LCP, FID, CLS, TTFB

#### Key Metrics

**Core Web Vitals**:
- **LCP (Largest Contentful Paint)**: < 2.5s (good)
- **FID (First Input Delay)**: < 100ms (good)
- **CLS (Cumulative Layout Shift)**: < 0.1 (good)
- **TTFB (Time to First Byte)**: < 600ms (good)

### Custom Performance Tracking

```typescript
import * as Sentry from '@sentry/nextjs';

// Start transaction
const transaction = Sentry.startTransaction({
  name: 'Product Search',
  op: 'search',
});

// Create span for specific operation
const span = transaction.startChild({
  op: 'http',
  description: 'Fetch products from API',
});

try {
  const products = await fetchProducts();
  span.setStatus('ok');
} catch (error) {
  span.setStatus('internal_error');
  throw error;
} finally {
  span.finish();
  transaction.finish();
}
```

### Performance Budget

Set performance budgets:

| Resource | Budget | Current | Status |
|----------|--------|---------|--------|
| Total JS | < 300 KB | 250 KB | ✓ |
| Total CSS | < 50 KB | 35 KB | ✓ |
| Total Images | < 500 KB | 400 KB | ✓ |
| Total Size | < 1 MB | 750 KB | ✓ |
| Load Time | < 2s | 1.5s | ✓ |

Monitor with bundle analyzer:

```bash
npm run build:analyze
```

### Real User Monitoring (RUM)

Track actual user experiences:

```javascript
// Track custom metrics
const navigation = performance.getEntriesByType('navigation')[0];
const loadTime = navigation.loadEventEnd - navigation.fetchStart;

// Send to analytics
gtag('event', 'page_load', {
  page_load_time: loadTime,
  page_path: window.location.pathname,
});
```

---

## Alerting

### Alert Channels

| Channel | Use Case | Response Time |
|---------|----------|---------------|
| **Email** | Non-urgent alerts | 1-4 hours |
| **Slack** | Team notifications | 15-60 minutes |
| **PagerDuty** | Critical incidents | 5-15 minutes |
| **SMS** | On-call emergencies | Immediate |

### Alert Types

#### Critical Alerts (P1)

**Trigger**: Service completely down

**Conditions**:
- Health check fails 3 times in a row
- Error rate > 10%
- Container not running

**Action**:
- PagerDuty incident
- SMS to on-call engineer
- Slack notification (#critical)

#### High Priority Alerts (P2)

**Trigger**: Major functionality broken

**Conditions**:
- Error rate > 1%
- Response time P95 > 5s
- Memory usage > 85%

**Action**:
- Slack notification (#alerts)
- Email to devops@psinfoodservice.com

#### Medium Priority Alerts (P3)

**Trigger**: Performance degradation

**Conditions**:
- Response time P95 > 2s
- CPU usage > 70%
- Error rate > 0.5%

**Action**:
- Email notification
- Log to monitoring dashboard

### Alert Configuration

#### Health Check Alert Script

```bash
#!/bin/bash
# alert-health.sh

URL="https://foodbook.psinfoodservice.com/api/health"
FAILURES=0
MAX_FAILURES=3

while true; do
  if ! curl -sf "$URL" > /dev/null; then
    FAILURES=$((FAILURES + 1))

    if [ $FAILURES -ge $MAX_FAILURES ]; then
      # Send alert
      curl -X POST https://slack.com/api/chat.postMessage \
        -H "Authorization: Bearer $SLACK_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
          \"channel\": \"#alerts\",
          \"text\": \":rotating_light: Health check failed $FAILURES times!\"
        }"

      FAILURES=0
    fi
  else
    FAILURES=0
  fi

  sleep 60
done
```

#### Sentry Alert Rules

Configure in Sentry Dashboard:

1. **Navigate**: Alerts → Create Alert Rule
2. **Condition**: Select trigger condition
3. **Actions**: Configure notifications
4. **Save**: Activate alert rule

### Alert Best Practices

1. **Avoid Alert Fatigue**: Only alert on actionable items
2. **Clear Thresholds**: Define precise trigger conditions
3. **Escalation Path**: Define who gets alerted when
4. **Runbook Links**: Include troubleshooting steps
5. **Alert Grouping**: Group similar alerts
6. **Regular Review**: Adjust thresholds based on experience

---

## Dashboards

### Monitoring Dashboard

Create a centralized monitoring dashboard.

#### Grafana Dashboard (Future Enhancement)

**Panels**:
1. **System Health**:
   - Container status
   - Health check status
   - Uptime percentage

2. **Performance**:
   - Response time (P50, P95, P99)
   - Request rate
   - Error rate

3. **Resources**:
   - CPU usage
   - Memory usage
   - Network I/O

4. **Business Metrics**:
   - Daily active users
   - Search volume
   - Product views

#### Sentry Dashboard

**Access**: Sentry → Dashboards → Create Dashboard

**Widgets**:
1. Error count by time
2. Top errors by frequency
3. Affected users
4. Performance trends
5. Release health

#### Custom Dashboard

Simple HTML dashboard:

```html
<!DOCTYPE html>
<html>
<head>
  <title>PS Foodbook Monitoring</title>
  <meta http-equiv="refresh" content="30">
</head>
<body>
  <h1>PS Foodbook Status</h1>

  <div id="health">Loading...</div>
  <div id="metrics">Loading...</div>

  <script>
    async function updateDashboard() {
      // Health check
      const health = await fetch('/api/health').then(r => r.json());
      document.getElementById('health').innerHTML =
        `Status: ${health.status} (${health.timestamp})`;

      // Container metrics
      const metricsResponse = await fetch('/api/metrics');
      const metrics = await metricsResponse.json();
      document.getElementById('metrics').innerHTML =
        `CPU: ${metrics.cpu}% | Memory: ${metrics.memory}MB`;
    }

    updateDashboard();
    setInterval(updateDashboard, 30000);
  </script>
</body>
</html>
```

---

## SLIs, SLOs, and SLAs

### Service Level Indicators (SLIs)

**Measurable metrics** of service performance:

1. **Availability**: Percentage of successful health checks
2. **Latency**: Response time for requests
3. **Error Rate**: Percentage of failed requests
4. **Throughput**: Requests per second

### Service Level Objectives (SLOs)

**Internal targets** for SLIs:

| SLO | Target | Measurement Period |
|-----|--------|-------------------|
| **Availability** | 99.9% | 30 days |
| **Latency (P95)** | < 500ms | 24 hours |
| **Error Rate** | < 0.1% | 24 hours |
| **Page Load Time** | < 2s | 7 days |

**Error Budget**: 0.1% × 30 days = 43 minutes of downtime per month

### Service Level Agreements (SLAs)

**External commitments** to users:

| Metric | Commitment | Compensation |
|--------|-----------|--------------|
| **Uptime** | 99.5% monthly | Service credit |
| **Support Response** | < 4 hours | Escalation |

### Tracking SLIs/SLOs

```bash
# Calculate availability over last 30 days
total_checks=$(docker logs --since 720h ps-foodbook-app | grep "health" | wc -l)
failed_checks=$(docker logs --since 720h ps-foodbook-app | grep "health.*failed" | wc -l)
availability=$(echo "scale=4; (1 - $failed_checks / $total_checks) * 100" | bc)

echo "Availability: $availability%"
```

---

## Troubleshooting with Monitoring

### Common Issues and Monitoring Indicators

#### Issue: High Error Rate

**Indicators**:
- Sentry: Spike in error count
- Logs: Increased ERROR level messages
- Health check: May be failing

**Investigation**:
```bash
# Check recent errors
docker logs --since 1h ps-foodbook-app | grep ERROR

# Check Sentry for patterns
# Navigate to Sentry → Issues → Sort by frequency
```

#### Issue: Slow Performance

**Indicators**:
- Sentry: High P95 latency
- Health check: Slow response time
- Logs: Timeout messages

**Investigation**:
```bash
# Check response times
time curl https://foodbook.psinfoodservice.com/

# Check resource usage
docker stats --no-stream ps-foodbook-app

# Check backend API performance
time curl $FOODBOOK_API_URL/api/health
```

#### Issue: Memory Leak

**Indicators**:
- Docker stats: Increasing memory usage
- Container restarts: Frequent OOM kills
- Performance degradation over time

**Investigation**:
```bash
# Monitor memory over time
watch -n 5 'docker stats --no-stream ps-foodbook-app'

# Check for OOM kills
docker inspect ps-foodbook-app | jq '.State.OOMKilled'

# Restart to mitigate
docker restart ps-foodbook-app
```

### Monitoring Checklist During Incidents

- [ ] Check health endpoint status
- [ ] Review recent error logs
- [ ] Check Sentry for error spikes
- [ ] Verify resource usage (CPU, memory)
- [ ] Test critical user flows
- [ ] Check backend API status
- [ ] Review recent deployments
- [ ] Check for infrastructure issues

---

## Summary

### Quick Reference

```bash
# Health check
curl http://localhost:3000/api/health

# View logs
docker logs -f --tail 100 ps-foodbook-app

# Container metrics
docker stats ps-foodbook-app

# Check errors
docker logs --since 1h ps-foodbook-app | grep ERROR

# Sentry dashboard
open https://sentry.io/organizations/ps-foodservice/projects/ps-foodbook/
```

### Key Monitoring URLs

- **Health Check**: `https://foodbook.psinfoodservice.com/api/health`
- **Sentry Dashboard**: `https://sentry.io/organizations/ps-foodservice/projects/ps-foodbook/`
- **Google Analytics**: `https://analytics.google.com/`

### Contact Information

- **Monitoring Issues**: devops@psinfoodservice.com
- **Critical Alerts**: oncall@psinfoodservice.com
- **Sentry Support**: https://sentry.io/support/

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-27
**Next Review**: 2026-04-27
**Owner**: PS in Foodservice DevOps Team
