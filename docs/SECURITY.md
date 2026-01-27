# Security Guide - PS Foodbook App

## Overview

This document outlines security best practices, procedures, and checklists for the PS Foodbook application. Security is a shared responsibility across development, operations, and infrastructure teams.

**Security Philosophy**: Defense in depth with multiple layers of protection.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Security](#data-security)
4. [API Security](#api-security)
5. [Environment Security](#environment-security)
6. [Dependency Security](#dependency-security)
7. [Container Security](#container-security)
8. [Network Security](#network-security)
9. [Monitoring & Logging](#monitoring--logging)
10. [Incident Response](#incident-response)
11. [Security Checklist](#security-checklist)
12. [Vulnerability Management](#vulnerability-management)

---

## Security Overview

### Security Layers

```
User → HTTPS/TLS → Reverse Proxy → Container → Application → Backend API
       └─────────────────────────────────────────────────┘
                  Multiple security layers
```

### Key Security Features

- **Transport Security**: HTTPS with TLS 1.2+
- **Authentication**: JWT tokens with HTTP-only cookies
- **Authorization**: Token-based access control
- **Input Validation**: Zod schemas for runtime validation
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookies
- **Rate Limiting**: Request throttling
- **Security Headers**: OWASP recommended headers
- **Container Isolation**: Non-root user, minimal attack surface
- **Dependency Scanning**: Automated vulnerability checks

### Threat Model

**Protected Assets**:
- User session tokens
- Product data and pricing
- Catalog configurations
- Backend API access

**Potential Threats**:
- Unauthorized access to user sessions
- XSS attacks via user input
- CSRF attacks
- SQL injection (backend)
- DDoS attacks
- Container escape
- Dependency vulnerabilities

---

## Authentication & Authorization

### JWT Token Security

#### Token Generation

**Requirements**:
- Minimum 32-character random secret (`JWT_SECRET`)
- HS256 algorithm (HMAC with SHA-256)
- Expiration time enforced (`SESSION_DURATION`)
- Issued timestamp (iat) included
- Expiration timestamp (exp) included

**Implementation**: `src/lib/auth/jwt.ts`

```typescript
import { SignJWT, jwtVerify } from 'jose';

// Generate token
const token = await new SignJWT(payload)
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('24h')
  .sign(secret);
```

#### Token Storage

**✓ Secure Method** (Current implementation):
- Stored in HTTP-only cookies
- SameSite=Lax (prevents CSRF)
- Secure flag in production (HTTPS only)
- Domain restriction (`.psinfoodservice.com`)

**✗ Insecure Methods** (Avoid):
- LocalStorage (vulnerable to XSS)
- SessionStorage (vulnerable to XSS)
- Regular cookies without HTTP-only flag

#### Token Validation

Validate tokens on every protected request:

```typescript
// API route validation
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: Request) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Proceed with authenticated request
}
```

### Secret Management

#### JWT Secret

**Generation**:
```bash
# Generate cryptographically secure secret (minimum 32 bytes)
openssl rand -base64 32
```

**Storage**:
- ✓ Environment variables (.env.production)
- ✓ Secret management service (AWS Secrets Manager, HashiCorp Vault)
- ✗ **NEVER** commit to Git
- ✗ **NEVER** hardcode in source code

**Rotation**:
```bash
# Step 1: Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# Step 2: Update environment variable
echo "JWT_SECRET=$NEW_SECRET" >> .env.production

# Step 3: Restart application
docker-compose restart

# NOTE: This invalidates all existing sessions
```

#### Permalink Secret

Used for generating secure permalink tokens:

```bash
# Generate unique secret
openssl rand -base64 32
```

Store in `PERMALINK_SECRET` environment variable.

**Rotation Frequency**: Every 90 days

### Session Management

**Session Duration**: Configurable via `SESSION_DURATION` (default: 86400 seconds / 24 hours)

**Session Expiry**: Tokens automatically expire after duration

**Logout**: Clear auth cookie and invalidate client-side state

```typescript
// Logout implementation
import { clearAuthToken } from '@/lib/auth/cookies';

export async function POST() {
  await clearAuthToken();
  return NextResponse.json({ success: true });
}
```

---

## Data Security

### Input Validation

**All user input MUST be validated** before processing.

#### Runtime Validation with Zod

```typescript
import { z } from 'zod';

// Define schema
const searchSchema = z.object({
  keyword: z.string().min(2).max(100),
  locale: z.enum(['nl', 'en', 'de', 'fr']),
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100)
});

// Validate input
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = searchSchema.parse(body);
    // Use validated data
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }
}
```

#### Sanitization

**HTML Sanitization**:
```typescript
import { sanitizeHtml } from '@/lib/utils/validation';

// Remove potentially dangerous HTML
const safeHtml = sanitizeHtml(userInput);
```

**URL Validation**:
```typescript
// Validate URLs before use
const urlPattern = /^https?:\/\//;
if (!urlPattern.test(url)) {
  throw new Error('Invalid URL');
}
```

### Output Encoding

**Prevent XSS by encoding output**:

- React automatically encodes JSX content
- For `dangerouslySetInnerHTML`, always sanitize first
- Use type-safe translation functions

```typescript
// ✓ Safe - React auto-escapes
<h1>{userInput}</h1>

// ✗ Dangerous - requires sanitization
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userInput) }} />
```

### Sensitive Data Handling

**DO NOT log sensitive data**:
- Passwords
- JWT tokens
- API keys
- Personal information (email, phone)

**Logging Example**:
```typescript
// ✗ Bad
logger.info('User logged in', { token: userToken });

// ✓ Good
logger.info('User logged in', { userId: user.id });
```

### Data at Rest

Currently, the application does not store user data at rest. All data is:
- Fetched from backend API
- Cached temporarily in memory (ISR)
- Stored in user browser (cookies for auth)

**If storing data in future**:
- Encrypt sensitive data
- Use AES-256 encryption
- Secure key management (AWS KMS, Azure Key Vault)

### Data in Transit

**All data MUST be transmitted over HTTPS**:

```nginx
# Nginx configuration
server {
  listen 80;
  server_name foodbook.psinfoodservice.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name foodbook.psinfoodservice.com;

  ssl_certificate /etc/ssl/certs/foodbook.crt;
  ssl_certificate_key /etc/ssl/private/foodbook.key;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  # ... rest of config
}
```

---

## API Security

### Security Headers

**Configured in `next.config.ts`**:

```typescript
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY', // Prevent clickjacking
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff', // Prevent MIME sniffing
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' https://cdn.psinfoodservice.com",
  },
];
```

### Rate Limiting

**Current Implementation**: Client-side throttling (1 req/sec per endpoint)

**Recommended Production Implementation**:

#### Option 1: Nginx Rate Limiting

```nginx
# Define rate limit zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# Apply to API routes
location /api/ {
  limit_req zone=api burst=20 nodelay;
  limit_req_status 429;
  proxy_pass http://localhost:3000;
}
```

#### Option 2: Application-Level Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? 'unknown';
  const { success, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  }

  return NextResponse.next();
}
```

### CORS Policy

**Current**: Same-origin only (no CORS headers)

**If enabling CORS**:

```typescript
// Only allow specific origins
const allowedOrigins = [
  'https://foodbook.psinfoodservice.com',
  'https://staging.foodbook.psinfoodservice.com',
];

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  if (origin && allowedOrigins.includes(origin)) {
    return NextResponse.next({
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  return NextResponse.next();
}
```

### API Request Validation

**Always validate**:
- Request method (GET, POST, etc.)
- Content-Type header
- Request body structure
- Parameter types and ranges

```typescript
export async function POST(request: Request) {
  // Validate Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Invalid Content-Type' },
      { status: 400 }
    );
  }

  // Validate body
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    // Process validated data
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
```

### Backend API Security

**Secure communication with backend**:

```typescript
// Include auth token if required
const response = await fetch(FOODBOOK_API_URL, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'PS-Foodbook-Frontend/1.0.0',
  },
  // Enforce timeout
  signal: AbortSignal.timeout(15000),
});
```

**Validate backend responses**:

```typescript
// Use Zod to validate API responses
const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  // ... other fields
});

const data = await response.json();
const validated = ProductSchema.parse(data);
```

---

## Environment Security

### Environment Variables

**Classification**:

**Public** (can be exposed to browser):
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_GTM_ID`

**Private** (server-side only):
- `JWT_SECRET` ⚠️ Critical
- `PERMALINK_SECRET` ⚠️ Critical
- `FOODBOOK_API_URL`
- `SENTRY_DSN`

**Rules**:
- ✓ Store in `.env.production` (not committed to Git)
- ✓ Restrict file permissions (`chmod 600 .env.production`)
- ✓ Use environment-specific values
- ✗ **NEVER** commit secrets to Git
- ✗ **NEVER** log secret values

### Environment File Security

```bash
# Set restrictive permissions
chmod 600 .env.production

# Verify ownership
chown app-user:app-user .env.production

# Check no secrets in Git history
git log --all --full-history --source -- .env*
```

### .gitignore Configuration

Ensure `.gitignore` includes:

```
# Environment files
.env
.env.local
.env.*.local
.env.production
.env.staging

# Secrets and credentials
*.pem
*.key
*.cert
secrets/
```

### Docker Secrets

For Docker Swarm or Kubernetes:

```yaml
# docker-compose.yml with secrets
version: '3.8'

services:
  app:
    image: ps-foodbook-app:latest
    secrets:
      - jwt_secret
      - permalink_secret
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret

secrets:
  jwt_secret:
    external: true
  permalink_secret:
    external: true
```

---

## Dependency Security

### npm Audit

**Run regularly** to check for vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# View detailed report
npm audit --json

# Fix automatically (use with caution)
npm audit fix

# Fix breaking changes (review carefully)
npm audit fix --force
```

**Automated Checks**: GitHub Dependabot enabled

### Dependency Updates

**Strategy**: Regular updates with testing

```bash
# Check outdated packages
npm outdated

# Update non-breaking (patch/minor)
npm update

# Update major versions (test thoroughly)
npm install package@latest
```

**Testing after updates**:
```bash
# Run full test suite
npm run type-check
npm run lint
npm test -- --run
npm run test:e2e

# Build verification
npm run build
```

### Dependency Scanning in CI

**GitHub Actions** (`.github/workflows/ci.yml`):

```yaml
- name: Run security audit
  run: npm audit --audit-level=high

- name: Check for outdated dependencies
  run: npm outdated || true
```

### Lock File Integrity

**Always commit `package-lock.json`**:

```bash
# Use exact versions
npm ci  # Instead of npm install

# Verify lock file integrity
npm audit signatures
```

### Supply Chain Security

**Best Practices**:
1. Only install from npm registry
2. Verify package authenticity
3. Review dependency changes in PRs
4. Use `npm ci` in production
5. Enable GitHub Dependabot
6. Monitor security advisories

---

## Container Security

### Non-Root User

**Container runs as non-root user** (`nextjs:1001`):

```dockerfile
FROM node:18-alpine AS runner

# Create user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ... build steps ...

USER nextjs  # Run as non-root
EXPOSE 3000
```

### Minimal Base Image

**Use Alpine Linux** for smaller attack surface:

```dockerfile
FROM node:18-alpine  # 160MB vs 900MB for node:18
```

### Image Scanning

**Scan for vulnerabilities**:

```bash
# Using Docker Scout
docker scout cves ps-foodbook-app:latest

# Using Trivy
trivy image ps-foodbook-app:latest

# Using Snyk
snyk container test ps-foodbook-app:latest
```

**CI/CD Integration**:

```yaml
# .github/workflows/ci.yml
- name: Scan Docker image
  run: |
    docker scout cves --exit-code --only-severity critical,high ${{ github.repository }}:latest
```

### Resource Limits

**Prevent resource exhaustion**:

```yaml
# docker-compose.yml
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

### Container Hardening

**Additional security**:

```yaml
# docker-compose.yml
services:
  app:
    read_only: true  # Read-only filesystem
    cap_drop:
      - ALL  # Drop all capabilities
    cap_add:
      - NET_BIND_SERVICE  # Only add required capabilities
    security_opt:
      - no-new-privileges:true  # Prevent privilege escalation
```

### Registry Security

**Private Docker Registry**:

```bash
# Use authentication
docker login registry.psinfoodservice.com

# Push with authentication
docker push registry.psinfoodservice.com/ps-foodbook-app:latest
```

---

## Network Security

### HTTPS/TLS

**Requirements**:
- TLS 1.2 or higher
- Strong cipher suites
- Valid SSL certificate
- HSTS header enabled

**Nginx Configuration**:

```nginx
server {
  listen 443 ssl http2;
  server_name foodbook.psinfoodservice.com;

  # SSL Certificates
  ssl_certificate /etc/ssl/certs/foodbook.crt;
  ssl_certificate_key /etc/ssl/private/foodbook.key;

  # TLS Configuration
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
  ssl_prefer_server_ciphers on;

  # HSTS Header
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  # ... rest of config
}
```

**Certificate Management**:
- Use Let's Encrypt for free certificates
- Automate renewal with certbot
- Monitor expiration dates

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d foodbook.psinfoodservice.com

# Auto-renewal (runs twice daily)
systemctl enable certbot.timer
```

### Firewall Rules

**Only expose necessary ports**:

```bash
# UFW (Ubuntu Firewall)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP (redirects to HTTPS)
ufw allow 443/tcp  # HTTPS
ufw enable
```

### Network Isolation

**Docker network isolation**:

```yaml
# docker-compose.yml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access

services:
  app:
    networks:
      - frontend
      - backend
```

### DDoS Protection

**Mitigation strategies**:

1. **Rate Limiting** (see API Security)
2. **Connection Limits**:
   ```nginx
   limit_conn_zone $binary_remote_addr zone=addr:10m;
   limit_conn addr 10;
   ```

3. **Request Size Limits**:
   ```nginx
   client_max_body_size 1M;
   client_body_buffer_size 1M;
   ```

4. **CDN/WAF**: Use Cloudflare or AWS CloudFront

---

## Monitoring & Logging

### Security Logging

**Log security events**:
- Failed authentication attempts
- Invalid JWT tokens
- Rate limit violations
- Unusual access patterns
- API errors

**Implementation**:

```typescript
import { logger } from '@/lib/utils/logger';

// Log security events
logger.warn('Failed authentication attempt', {
  ip: request.ip,
  endpoint: request.url,
  reason: 'Invalid token',
});

// Log suspicious activity
logger.error('Potential attack detected', {
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
  pattern: 'SQL injection attempt',
});
```

### Audit Trail

**Track important actions**:
- User logins/logouts
- Configuration changes
- Deployment events
- Security incidents

### Sentry Integration

**Error tracking and monitoring**:

```bash
# .env.production
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=ps-foodbook
```

**Sentry Dashboard**: Monitor for:
- Authentication errors
- API failures
- Performance issues
- User-reported errors

### Log Retention

**Retention policy**:
- Security logs: 90 days minimum
- Application logs: 30 days
- Access logs: 30 days
- Audit logs: 1 year

### Alerting

**Set up alerts for**:
- High error rate (> 1%)
- Failed authentication spikes
- Unusual traffic patterns
- Resource exhaustion
- Certificate expiration

---

## Incident Response

### Security Incident Types

**P1 - Critical**:
- Data breach
- Compromised credentials
- Active attack
- System compromise

**P2 - High**:
- Vulnerability disclosure
- Suspicious access patterns
- Failed security controls

**P3 - Medium**:
- Outdated dependencies
- Configuration issues

### Incident Response Procedure

#### Phase 1: Detection (0-15 minutes)

1. **Identify incident**:
   - Alert received
   - Suspicious logs
   - User report

2. **Initial assessment**:
   - Determine severity
   - Identify affected systems
   - Gather initial evidence

3. **Activate response team**:
   - Alert security team
   - Notify on-call engineer
   - Start incident log

#### Phase 2: Containment (15-60 minutes)

1. **Immediate containment**:
   ```bash
   # Isolate container
   docker network disconnect bridge ps-foodbook-app

   # Stop affected service
   docker-compose down

   # Block malicious IP
   ufw deny from <IP-ADDRESS>
   ```

2. **Preserve evidence**:
   ```bash
   # Capture logs
   docker logs ps-foodbook-app > incident-logs-$(date +%Y%m%d-%H%M%S).log

   # Save container state
   docker commit ps-foodbook-app ps-foodbook-app:incident-$(date +%Y%m%d)
   ```

3. **Assess impact**:
   - Determine scope
   - Identify compromised data
   - Check for persistence

#### Phase 3: Eradication (1-4 hours)

1. **Remove threat**:
   ```bash
   # Rotate secrets
   NEW_JWT_SECRET=$(openssl rand -base64 32)
   sed -i "s/JWT_SECRET=.*/JWT_SECRET=$NEW_JWT_SECRET/" .env.production

   # Rebuild clean container
   docker-compose down -v
   docker rmi ps-foodbook-app:latest
   docker-compose build --no-cache
   ```

2. **Apply patches**:
   - Update vulnerable dependencies
   - Apply security fixes
   - Harden configuration

3. **Verify clean state**:
   - Scan for vulnerabilities
   - Review logs
   - Test security controls

#### Phase 4: Recovery (2-8 hours)

1. **Restore services**:
   ```bash
   # Deploy patched version
   docker-compose up -d

   # Verify health
   curl https://foodbook.psinfoodservice.com/api/health
   ```

2. **Monitor closely**:
   - Watch logs for 24 hours
   - Check for recurrence
   - Monitor metrics

3. **Communicate status**:
   - Update stakeholders
   - Post-incident report
   - User notification (if required)

#### Phase 5: Lessons Learned (1-2 weeks)

1. **Post-mortem meeting**
2. **Document incident**
3. **Update procedures**
4. **Implement preventive measures**

### Contact Information

**Security Team**:
- Email: security@psinfoodservice.com
- Phone: +31 XX XXX XXXX
- On-call: oncall@psinfoodservice.com

**Escalation**:
- Security Lead
- CTO
- Legal (for data breaches)

---

## Security Checklist

### Pre-Deployment Security Checklist

- [ ] All secrets are unique and cryptographically random (min 32 chars)
- [ ] JWT_SECRET is not the example value
- [ ] PERMALINK_SECRET is not the example value
- [ ] No secrets in Git history
- [ ] Environment files have restrictive permissions (chmod 600)
- [ ] npm audit shows no critical/high vulnerabilities
- [ ] Docker image scanned for vulnerabilities
- [ ] HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] CORS policy is restrictive
- [ ] Input validation is implemented
- [ ] Sensitive data is not logged
- [ ] Container runs as non-root user
- [ ] Resource limits are configured
- [ ] Monitoring and alerting are configured
- [ ] Incident response plan is documented
- [ ] Team members know escalation procedures

### Monthly Security Review

- [ ] Review access logs for suspicious patterns
- [ ] Check for outdated dependencies (`npm outdated`)
- [ ] Run security audit (`npm audit`)
- [ ] Scan Docker images for vulnerabilities
- [ ] Review Sentry for security-related errors
- [ ] Verify SSL certificate validity (> 30 days remaining)
- [ ] Review and update firewall rules
- [ ] Test incident response procedures
- [ ] Review and rotate secrets (if needed)
- [ ] Update security documentation

### Quarterly Security Audit

- [ ] Penetration testing (if required)
- [ ] Security configuration review
- [ ] Access control audit
- [ ] Dependency security audit
- [ ] Log retention compliance
- [ ] Disaster recovery test
- [ ] Security training for team
- [ ] Third-party security review
- [ ] Update threat model
- [ ] Review and update security policies

---

## Vulnerability Management

### Vulnerability Sources

**Monitor**:
1. **npm audit**: `npm audit --audit-level=high`
2. **GitHub Dependabot**: Automated PR for vulnerable dependencies
3. **Docker Scout**: Container vulnerability scanning
4. **Sentry**: Runtime error monitoring
5. **Security Advisories**: GitHub Security Advisories

### Severity Levels

| Severity | Response Time | Action |
|----------|--------------|---------|
| **Critical** | 24 hours | Immediate patch and deploy |
| **High** | 7 days | Priority fix and deploy |
| **Medium** | 30 days | Scheduled fix in next release |
| **Low** | 90 days | Backlog for future release |

### Patching Process

1. **Identify vulnerability**:
   ```bash
   npm audit
   ```

2. **Assess impact**:
   - Determine if vulnerability is exploitable
   - Check if affected code is used
   - Assess risk to application

3. **Apply patch**:
   ```bash
   # Update to patched version
   npm update package-name

   # Or install specific version
   npm install package-name@version
   ```

4. **Test thoroughly**:
   ```bash
   npm run type-check
   npm run lint
   npm test -- --run
   npm run test:e2e
   npm run build
   ```

5. **Deploy**:
   - Deploy to staging
   - Verify fix
   - Deploy to production

6. **Verify**:
   ```bash
   # Confirm vulnerability is fixed
   npm audit
   ```

### Zero-Day Vulnerabilities

**If a zero-day is discovered**:

1. **Assess immediately**: Determine if application is affected
2. **Mitigate**: Apply workarounds if patch unavailable
   - Disable affected feature
   - Add WAF rules
   - Increase monitoring
3. **Monitor**: Watch for exploit attempts
4. **Patch**: Apply official patch as soon as available

---

## Compliance

### GDPR Considerations

While the application doesn't store personal data, it processes:
- User session tokens (authentication)
- IP addresses (logging)
- Usage analytics (optional)

**Requirements**:
- Privacy policy published
- Cookie consent (if analytics enabled)
- Right to be forgotten (clear sessions)
- Data minimization (don't log unnecessary data)

### Security Standards

**Recommendations**:
- **OWASP Top 10**: Address all OWASP vulnerabilities
- **CWE Top 25**: Mitigate common weakness enumeration
- **ISO 27001**: Information security management
- **SOC 2**: Service organization controls

### Security Certifications

Consider obtaining:
- ISO 27001 certification
- SOC 2 Type II compliance
- PCI DSS (if processing payments in future)

---

## Additional Resources

### OWASP Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)

### Next.js Security

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/routing/authentication)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

### Docker Security

- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-27
**Next Review**: 2026-04-27
**Owner**: PS in Foodservice Security Team
