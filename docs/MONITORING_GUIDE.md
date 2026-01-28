# Monitoring & Observability Guide

This guide covers monitoring, logging, error tracking, and observability for the PS Foodbook application.

## Table of Contents

- [Overview](#overview)
- [Health Checks](#health-checks)
- [Error Tracking (Sentry)](#error-tracking-sentry)
- [Application Logging](#application-logging)
- [Performance Monitoring](#performance-monitoring)
- [Metrics & Dashboards](#metrics--dashboards)
- [Alerts & Notifications](#alerts--notifications)
- [Troubleshooting](#troubleshooting)

## Overview

The PS Foodbook application uses a multi-layered monitoring approach:

- **Health Checks**: Container and application health monitoring
- **Error Tracking**: Sentry for error capture and analysis
- **Application Logging**: Structured logging to console/files
- **Performance Monitoring**: Sentry performance insights
- **Infrastructure Metrics**: Docker/container metrics

## Health Checks

### Application Health Endpoint

The application exposes a health check endpoint at `/api/health`:

```bash
GET http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-27T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

**Status Codes:**
- `200 OK` - Application is healthy
- `503 Service Unavailable` - Application is unhealthy

### Docker Health Checks

Docker Compose automatically monitors application health:

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**Health Check Behavior:**
- Checks every 30 seconds
- 10 second timeout per check
- 3 retries before marking unhealthy
- 40 second grace period on startup

**Monitoring Health Status:**
```bash
# Check container health
docker ps

# View health check logs
docker inspect ps-foodbook-app | grep -A 10 Health

# Check health from command line
docker exec ps-foodbook-app wget --spider http://localhost:3000/api/health
```

## Error Tracking (Sentry)

### Sentry Setup

Sentry is integrated for error tracking and performance monitoring.

**Environment Configuration:**
```bash
# .env.production
NEXT_PUBLIC_SENTRY_DSN=https://your-project@o123456.ingest.sentry.io/7890123
SENTRY_ORG=ps-foodservice
SENTRY_PROJECT=foodbook-frontend
SENTRY_AUTH_TOKEN=your-auth-token
```

**Configuration Files:**
- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration
- `sentry.edge.config.ts` - Edge runtime configuration

### Error Tracking Features

**Automatic Error Capture:**
- Unhandled exceptions
- Promise rejections
- Console errors
- React error boundaries

**Custom Error Reporting:**
```typescript
import * as Sentry from '@sentry/nextjs';

// Capture exception with context
try {
  await fetchProducts();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'product-search',
      action: 'fetch-products'
    },
    extra: {
      filters: currentFilters,
      page: currentPage
    }
  });
}
```

**User Context:**
```typescript
// Set user context
Sentry.setUser({
  id: userId,
  email: userEmail,
  username: userName
});

// Clear user context on logout
Sentry.setUser(null);
```

### Sentry Dashboard

Access your Sentry dashboard at: https://sentry.io/organizations/ps-foodservice/projects/foodbook-frontend/

**Key Sections:**
- **Issues**: View and triage errors
- **Performance**: Monitor transaction performance
- **Releases**: Track deployments and regression
- **Discover**: Query custom metrics
- **Alerts**: Configure alert rules

### Alert Configuration

**Recommended Alerts:**

1. **High Error Rate**
   - Trigger: Error rate > 1% for 5 minutes
   - Notify: #alerts-critical Slack channel

2. **New Issue Detected**
   - Trigger: First occurrence of new error
   - Notify: #alerts-errors Slack channel

3. **Performance Degradation**
   - Trigger: P95 response time > 3s for 10 minutes
   - Notify: #alerts-performance Slack channel

## Application Logging

### Log Levels

The application uses structured logging with different levels:

- **ERROR**: Errors requiring immediate attention
- **WARN**: Warning conditions that should be reviewed
- **INFO**: Informational messages (default in production)
- **DEBUG**: Detailed debugging information (dev/staging only)

### Client-Side Logging

Client logs are sent to the `/api/log` endpoint:

```typescript
import { logger } from '@/lib/utils/logger';

// Log levels
logger.error('Failed to load products', { error, filters });
logger.warn('Slow API response', { duration, endpoint });
logger.info('User performed search', { keyword, resultsCount });
logger.debug('Filter state updated', { newFilters });
```

**Log Format:**
```json
{
  "level": "error",
  "message": "Failed to load products",
  "timestamp": "2024-01-27T12:00:00.000Z",
  "context": {
    "error": "Network timeout",
    "filters": { "category": "beverages" }
  },
  "userAgent": "Mozilla/5.0...",
  "url": "/product?category=beverages"
}
```

### Server-Side Logging

Server logs are written to stdout (captured by Docker):

```typescript
// In API routes or server components
console.error('[ERROR]', 'Database connection failed', { error });
console.warn('[WARN]', 'Cache miss', { key });
console.info('[INFO]', 'API request completed', { endpoint, duration });
```

### Viewing Logs

**Local Development:**
```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app

# Filter by time
docker-compose logs --since 30m
```

**Production:**
```bash
# View container logs
docker logs ps-foodbook-app

# Follow logs
docker logs -f ps-foodbook-app

# Last 100 lines
docker logs --tail 100 ps-foodbook-app

# Filter by timestamp
docker logs --since "2024-01-27T12:00:00" ps-foodbook-app
```

### Log Rotation

Docker Compose is configured with log rotation:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

This keeps:
- Maximum 10 MB per log file
- Maximum 3 log files
- Total maximum: 30 MB of logs

## Performance Monitoring

### Sentry Performance Monitoring

Sentry automatically tracks:
- Page load times
- API request durations
- Component render times
- Resource loading times

**Custom Transactions:**
```typescript
import * as Sentry from '@sentry/nextjs';

const transaction = Sentry.startTransaction({
  name: 'Product Search',
  op: 'search'
});

try {
  const results = await searchProducts(filters);
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

**Custom Spans:**
```typescript
const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
if (transaction) {
  const span = transaction.startChild({
    op: 'api.call',
    description: 'Fetch products from API'
  });

  try {
    await apiCall();
  } finally {
    span.finish();
  }
}
```

### Web Vitals

The application automatically reports Core Web Vitals to Sentry:

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 600ms

### Next.js Performance Metrics

Monitor via Vercel Analytics or custom implementation:

```typescript
export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (metric.label === 'web-vital') {
    Sentry.captureMessage(`Web Vital: ${metric.name}`, {
      level: 'info',
      extra: {
        value: metric.value,
        id: metric.id,
        name: metric.name
      }
    });
  }
}
```

## Metrics & Dashboards

### Key Metrics to Monitor

**Application Metrics:**
- Request rate (requests/min)
- Error rate (%)
- Response time (P50, P95, P99)
- Availability (%)

**Business Metrics:**
- Product searches per hour
- Product views per hour
- PDF downloads per day
- Catalog views per day

**Infrastructure Metrics:**
- CPU usage (%)
- Memory usage (MB)
- Container restarts
- Disk usage (%)

### Docker Metrics

Monitor container resource usage:

```bash
# Real-time resource usage
docker stats ps-foodbook-app

# Container information
docker inspect ps-foodbook-app

# Check restart count
docker inspect ps-foodbook-app | grep -A 3 RestartCount
```

### Creating Custom Dashboards

**Sentry Dashboard:**
1. Go to Sentry → Dashboards → Create Dashboard
2. Add widgets for:
   - Error frequency by endpoint
   - P95 response time by page
   - User impact (affected users)
   - Release comparison

**Grafana Dashboard (if using):**
1. Connect to Docker metrics endpoint
2. Create panels for CPU, memory, network
3. Add alerting rules

## Alerts & Notifications

### Slack Integration

Configure Slack notifications for critical events:

**Sentry Slack Integration:**
1. Go to Sentry → Settings → Integrations → Slack
2. Connect workspace
3. Configure alert rules to post to channels

**Recommended Channels:**
- `#alerts-critical` - Production errors, outages
- `#alerts-errors` - New errors, high error rates
- `#alerts-performance` - Performance degradation
- `#deployments` - Deployment notifications

### Email Alerts

Configure email alerts for:
- Application down (health check fails)
- Critical errors (500 responses)
- High error rate (> 1% for 5 min)
- Memory/CPU threshold exceeded

### PagerDuty Integration (Optional)

For 24/7 on-call rotation:
1. Configure PagerDuty service
2. Integrate with Sentry
3. Set escalation policies
4. Configure notification rules

## Troubleshooting

### Common Issues

#### 1. High Memory Usage

**Symptoms:**
- Container restarts
- Slow response times
- OOM errors in logs

**Investigation:**
```bash
# Check memory usage
docker stats ps-foodbook-app

# View memory-related logs
docker logs ps-foodbook-app | grep -i "memory\|heap"

# Check for memory leaks in Sentry
# Look for increasing heap usage over time
```

**Resolution:**
- Increase container memory limit
- Review TanStack Query cache size
- Check for memory leaks in components
- Optimize image loading

#### 2. High Error Rate

**Symptoms:**
- Spike in Sentry errors
- User complaints
- 500 responses

**Investigation:**
```bash
# Check recent errors
docker logs --tail 100 ps-foodbook-app | grep ERROR

# View error details in Sentry
# Check error grouping and affected users
```

**Resolution:**
- Identify root cause from stack traces
- Check API connectivity
- Verify environment variables
- Review recent deployments

#### 3. Slow Response Times

**Symptoms:**
- High P95 response time
- User complaints of slowness
- Timeout errors

**Investigation:**
```bash
# Check CPU usage
docker stats ps-foodbook-app

# Review slow transactions in Sentry
# Identify bottleneck operations
```

**Resolution:**
- Optimize database queries
- Increase cache revalidation time
- Enable ISR for static pages
- Review bundle size
- Add CDN for static assets

#### 4. Health Check Failures

**Symptoms:**
- Container marked unhealthy
- Automatic restarts
- Health check timeouts

**Investigation:**
```bash
# Check health endpoint directly
curl http://localhost:3000/api/health

# View health check logs
docker inspect ps-foodbook-app | grep -A 20 Health

# Check application logs
docker logs ps-foodbook-app
```

**Resolution:**
- Verify application is listening on port 3000
- Check health endpoint implementation
- Review startup time vs start_period
- Ensure dependencies are healthy

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# .env.production
LOG_LEVEL=debug
NEXT_PUBLIC_LOG_LEVEL=debug
```

**Warning:** Debug mode logs sensitive data. Disable in production after troubleshooting.

### Log Analysis Commands

```bash
# Count errors in last hour
docker logs ps-foodbook-app --since 1h | grep ERROR | wc -l

# Find specific error
docker logs ps-foodbook-app | grep -i "timeout"

# View errors with context (10 lines before/after)
docker logs ps-foodbook-app | grep -B 10 -A 10 ERROR

# Export logs to file
docker logs ps-foodbook-app > /tmp/app-logs-$(date +%Y%m%d-%H%M%S).log
```

## Monitoring Checklist

**Daily:**
- [ ] Check Sentry dashboard for new errors
- [ ] Review error trends and spikes
- [ ] Monitor application health status
- [ ] Check response time metrics

**Weekly:**
- [ ] Review Sentry performance insights
- [ ] Analyze Web Vitals trends
- [ ] Check log storage usage
- [ ] Review alert configurations

**Monthly:**
- [ ] Audit error grouping and resolution
- [ ] Review and update alert thresholds
- [ ] Optimize slow transactions
- [ ] Update monitoring documentation

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Monitoring](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [Docker Logging Best Practices](https://docs.docker.com/config/containers/logging/)
- [Web Vitals](https://web.dev/vitals/)

## Support

For monitoring issues or questions:
- **Internal**: #dev-support Slack channel
- **Sentry**: Check [status.sentry.io](https://status.sentry.io/)
- **On-call**: See PagerDuty rotation

---

*Last updated: 2024-01-27*
