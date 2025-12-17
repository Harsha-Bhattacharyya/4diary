# Self-Hosting Guide

Complete guide for hosting 4Diary on your own infrastructure with full control over your data.

## Why Self-Host?

**Benefits**:
- 🏠 **Complete Control**: Your server, your rules
- 🔒 **Maximum Privacy**: Data never leaves your infrastructure  
- 💰 **Cost Effective**: No per-user fees for teams
- ⚙️ **Customization**: Modify code as needed
- 🌍 **Data Residency**: Choose server location for compliance

## Quick Start with Docker

```bash
# Clone repository
git clone https://github.com/Harsha-Bhattacharyya/4diary.git
cd 4diary

# Configure environment
cp .env.example .env.production
nano .env.production

# Start services
docker-compose up -d

# Access at http://localhost:3000
```

## Environment Configuration

**Required Variables**:
```env
MONGODB_URI=mongodb://mongo:27017/4diary
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_BASE_URL=https://your-domain.com
SESSION_SECRET=your-long-random-secret-here
```

## Domain & SSL Setup

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal configured automatically
```

## Monitoring & Maintenance

### Health Checks

```bash
curl https://your-domain.com/api/health
```

### Backups

```bash
# Daily MongoDB backup
mongodump --uri="mongodb://localhost:27017/4diary" --out=/backups/4diary-$(date +%Y%m%d)
```

### Updates

```bash
git pull origin main
pnpm install --frozen-lockfile --prod
pnpm run build
pm2 restart 4diary
```

## Cost Estimation

- VPS: $5-10/month (DigitalOcean, Linode, Hetzner)
- Domain: $10-15/year
- **Total**: ~$10-20/month for unlimited users

## Next Steps

- See [Deployment Guide](../architecture/deployment.md) for detailed setup
- Review [Performance Optimization](./performance.md) for tuning
- Check [Troubleshooting Guide](../guides/troubleshooting.md)

---

**Last Updated**: November 2025  
**Tested On**: Ubuntu 22.04 LTS
