# Deployment Guide

Complete guide for deploying 4Diary to production environments.

## Overview

4Diary can be deployed in multiple ways depending on your needs:

1. **Vercel** (Recommended) - Easiest, managed platform
2. **Docker** - Containerized, self-hosted
3. **Traditional VPS** - Full control, manual setup
4. **Kubernetes** - Enterprise-scale orchestration

## Prerequisites

### Required Services

- **MongoDB 7.0+**: Document database
- **Redis 5.8+**: Share tokens and caching (optional but recommended)
- **Node.js 20+**: Runtime environment (for non-Docker deployments)

### Domain & SSL

- Registered domain name
- SSL/TLS certificate (Let's Encrypt recommended)
- DNS access for configuration

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Zero-config, automatic scaling, built-in CDN, free tier  
**Cons**: Less control, vendor lock-in

#### Step 1: Prepare Repository

```bash
# Ensure package.json has correct build script
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

#### Step 2: Configure Environment Variables

Create `.env.production`:

```env
# MongoDB (Required)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/4diary

# Redis (Optional, for sharing)
REDIS_URL=redis://user:pass@redis-host:6379

# App URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Session Secret (Generate random string)
SESSION_SECRET=your-very-long-random-secret-string-here

# Sentry (Optional, for error tracking)
SENTRY_DSN=https://...@sentry.io/...
```

#### Step 3: Deploy to Vercel

**Via Vercel CLI**:
```bash
# Install Vercel CLI
pnpm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Via Vercel Dashboard**:
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

#### Step 4: Configure Custom Domain

```bash
# Add domain via CLI
vercel domains add your-domain.com

# Or via dashboard:
# Project Settings → Domains → Add Domain
```

#### Step 5: Set Up MongoDB Atlas

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Configure network access (add Vercel IPs or allow all: `0.0.0.0/0`)
4. Create database user
5. Get connection string
6. Add to Vercel environment variables

#### Step 6: Set Up Redis (Optional)

**Option A: Upstash** (Recommended for Vercel):
```bash
# Create account at upstash.com
# Create Redis database
# Copy connection URL
# Add to Vercel environment variables
```

**Option B: Redis Labs**:
```bash
# Create account at redis.com
# Create free database
# Get connection URL
# Add to Vercel environment variables
```

### Option 2: Docker Deployment

**Pros**: Consistent environment, easy to replicate, isolated  
**Cons**: Requires Docker knowledge, resource overhead

#### Step 1: Create Dockerfile

Already included in repository:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

# Build application
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Step 2: Docker Compose Setup

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/4diary
      - REDIS_URL=redis://redis:6379
      - SESSION_SECRET=${SESSION_SECRET}
      - NEXT_PUBLIC_BASE_URL=${BASE_URL}
    depends_on:
      - mongo
      - redis
    restart: unless-stopped
    networks:
      - 4diary-network

  mongo:
    image: mongo:7.0
    volumes:
      - mongo-data:/data/db
      - mongo-config:/data/configdb
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASS}
      - MONGO_INITDB_DATABASE=4diary
    restart: unless-stopped
    networks:
      - 4diary-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/4diary --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASS}
    restart: unless-stopped
    networks:
      - 4diary-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx-cache:/var/cache/nginx
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - 4diary-network

volumes:
  mongo-data:
  mongo-config:
  redis-data:
  nginx-cache:

networks:
  4diary-network:
    driver: bridge
```

#### Step 3: Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # Proxy settings
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files caching
        location /_next/static/ {
            proxy_pass http://app;
            proxy_cache nginx-cache;
            proxy_cache_valid 200 365d;
            add_header Cache-Control "public, immutable";
        }

        # Client max body size
        client_max_body_size 10M;
    }
}
```

#### Step 4: Environment Variables

Create `.env.production`:

```env
# MongoDB
MONGO_USER=4diary_admin
MONGO_PASS=secure_random_password_here

# Redis
REDIS_PASS=another_secure_password

# Application
SESSION_SECRET=very_long_random_secret_at_least_32_chars
BASE_URL=https://your-domain.com

# Optional
SENTRY_DSN=https://...
```

#### Step 5: Deploy with Docker

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

#### Step 6: SSL with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/

# Set up auto-renewal
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet --deploy-hook "docker-compose -f /path/to/docker-compose.prod.yml restart nginx"
```

### Option 3: Traditional VPS

**Pros**: Full control, cost-effective for high traffic  
**Cons**: Manual setup, maintenance responsibility

#### Step 1: Server Setup

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Redis
sudo apt-get install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install Nginx
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Install PM2
sudo pnpm install -g pm2
```

#### Step 2: Deploy Application

```bash
# Clone repository
cd /var/www
git clone https://github.com/Harsha-Bhattacharyya/4diary.git
cd 4diary

# Install dependencies
pnpm install --frozen-lockfile --only=production

# Build application
pnpm run build

# Configure environment
cp .env.example .env.production
nano .env.production
# Edit with your values

# Start with PM2
pm2 start pnpm --name "4diary" -- start
pm2 save
pm2 startup
```

#### Step 3: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/4diary

# Add configuration (similar to Docker nginx.conf above)

# Enable site
sudo ln -s /etc/nginx/sites-available/4diary /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 4: Secure MongoDB

```bash
# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Enable authentication
sudo nano /etc/mongod.conf
# Add:
# security:
#   authorization: enabled

sudo systemctl restart mongod
```

#### Step 5: Monitoring

```bash
# PM2 monitoring
pm2 monit

# System monitoring
sudo apt-get install -y htop
htop

# Application logs
pm2 logs 4diary

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Option 4: Kubernetes

For enterprise deployments, see `k8s/` directory in repository (advanced).

## Post-Deployment Configuration

### Database Indexes

Ensure indexes are created:

```javascript
// Connect to MongoDB
mongosh "mongodb://localhost:27017/4diary"

// Create indexes
db.workspaces.createIndex({ email: 1 }, { unique: true });
db.documents.createIndex({ workspaceId: 1, createdAt: -1 });
db.documents.createIndex({ workspaceId: 1, type: 1 });
db.documents.createIndex({ workspaceId: 1, favorite: 1 });
db.documents.createIndex({ workspaceId: 1, archived: 1 });
db.documents.createIndex({ workspaceId: 1, folder: 1 });
db.documents.createIndex({ workspaceId: 1, updatedAt: -1 });
```

### Backup Strategy

**MongoDB Backup**:
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
mongodump --uri="mongodb://user:pass@localhost:27017/4diary" --out=/backups/4diary-$DATE
tar -czf /backups/4diary-$DATE.tar.gz /backups/4diary-$DATE
rm -rf /backups/4diary-$DATE

# Cron job (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh
```

**Redis Backup**:
```bash
# Redis automatically saves to disk
# Copy RDB file for backup
cp /var/lib/redis/dump.rdb /backups/redis-$(date +%Y%m%d).rdb
```

### Monitoring Setup

**Sentry Integration**:
```env
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
```

**Uptime Monitoring**:
- UptimeRobot
- Pingdom
- StatusCake

**Performance Monitoring**:
```bash
# PM2 Plus (optional, paid)
pm2 link <secret> <public>
```

## Security Hardening

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Security Headers

Already configured in Nginx, verify:

```bash
curl -I https://your-domain.com
# Should see:
# Strict-Transport-Security: max-age=31536000
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
```

### Regular Updates

```bash
# System updates
sudo apt-get update && sudo apt-get upgrade -y

# Node.js updates
pnpm outdated
pnpm update

# PM2 updates
pm2 update

# MongoDB updates
sudo apt-get upgrade mongodb-org
```

### Secrets Management

**Never commit secrets**:
```bash
# Use environment variables
# Or use secret managers:
# - AWS Secrets Manager
# - HashiCorp Vault
# - Azure Key Vault
```

## Performance Optimization

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['your-cdn.com'],
  },
  
  // Caching
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 5,
  },
};
```

### MongoDB Optimization

```javascript
// Connection pooling
const client = new MongoClient(uri, {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
});

// Query optimization
db.documents.find({ workspaceId: id }).limit(50).hint({ workspaceId: 1 });
```

### Redis Optimization

```bash
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### CDN Configuration

Use CDN for static assets:
- Cloudflare (free tier available)
- AWS CloudFront
- Vercel Edge Network (automatic)

## Scaling Strategies

### Horizontal Scaling

```yaml
# docker-compose with replicas
services:
  app:
    deploy:
      replicas: 3
    # ... rest of config
```

### Load Balancing

```nginx
upstream app_cluster {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000;
}
```

### Database Scaling

**MongoDB Replica Set**:
```bash
# Initialize replica set
mongosh
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
})
```

**Redis Cluster**:
```bash
# Redis Cluster for high availability
redis-cli --cluster create \
  redis1:6379 redis2:6379 redis3:6379 \
  --cluster-replicas 1
```

## Troubleshooting Deployment

### Application Won't Start

```bash
# Check logs
pm2 logs 4diary
# or
docker-compose logs app

# Check environment variables
env | grep MONGODB_URI

# Test MongoDB connection
mongosh "mongodb://localhost:27017/4diary"

# Check ports
sudo netstat -tulpn | grep :3000
```

### High Memory Usage

```bash
# Check Node.js memory
pm2 monit

# Increase memory limit
pm2 start pnpm --name "4diary" --max-memory-restart 1G -- start

# Or in Docker
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
```

### Slow Performance

```bash
# Check MongoDB slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(10)

# Check Redis latency
redis-cli --latency

# Check Nginx access logs
tail -f /var/log/nginx/access.log | grep -v "/_next/static"
```

## Maintenance

### Zero-Downtime Deployments

```bash
# PM2
pm2 reload 4diary

# Docker with rolling update
docker-compose -f docker-compose.prod.yml up -d --no-deps --build app
```

### Database Migrations

```bash
# Run migrations before deployment
pnpm run migrate

# Or use migration tools with pnpm
pnpm exec prisma migrate deploy
```

### Health Checks

Create `/api/health`:
```typescript
export async function GET() {
  const mongodb = await checkMongoDB();
  const redis = await checkRedis();
  
  return Response.json({
    status: mongodb && redis ? 'healthy' : 'unhealthy',
    mongodb,
    redis,
    timestamp: new Date().toISOString()
  });
}
```

## Cost Estimation

### Vercel (Managed)

- Free tier: $0/month (hobby projects)
- Pro: $20/month per user
- MongoDB Atlas: Free tier M0
- Redis: Upstash free tier (10K commands/day)

**Total**: $0-$20/month

### Self-Hosted VPS

- VPS: $5-$20/month (DigitalOcean, Linode)
- Domain: $10-$15/year
- SSL: Free (Let's Encrypt)

**Total**: $5-$20/month

### Enterprise

- Kubernetes cluster: $100-$500/month
- Managed MongoDB: $50-$200/month
- Redis: $20-$100/month
- CDN: $20-$100/month

**Total**: $190-$900/month

## Next Steps

- Review [Architecture Overview](./architecture.md) for system design
- Check [API Reference](./api-reference.md) for endpoints
- Read [Performance Optimization](../advanced/performance.md) for tuning
- See [Self-Hosting Guide](../advanced/self-hosting.md) for detailed setup

---

**Last Updated**: November 2025  
**Recommended**: Vercel for ease, Docker for control  
**Status**: Production-ready (v0.1.0-alpha)
