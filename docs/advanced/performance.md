# Performance Optimization

Guide to optimizing 4Diary for speed and efficiency.

## Client-Side Optimization

### Code Splitting

Next.js automatically splits code:
```typescript
// Dynamic imports for heavy components
const KanbanBoard = dynamic(() => import('@/components/kanban/Board'), {
  loading: () => <Loading />,
  ssr: false
});
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.svg"
  width={200}
  height={100}
  alt="4Diary"
  priority
/>
```

### Lazy Loading

```typescript
// Lazy load BlockNote editor
const BlockEditor = dynamic(
  () => import('@/components/editor/BlockEditor'),
  { ssr: false }
);
```

## Server-Side Optimization

### MongoDB Indexes

```javascript
// Essential indexes
db.documents.createIndex({ workspaceId: 1, createdAt: -1 });
db.documents.createIndex({ workspaceId: 1, type: 1 });
db.documents.createIndex({ workspaceId: 1, updatedAt: -1 });
```

### Connection Pooling

```typescript
// MongoDB connection pool
const client = new MongoClient(uri, {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000
});
```

### Redis Caching

```typescript
// Cache frequently accessed data
const cached = await redis.get(`doc:${id}`);
if (cached) return JSON.parse(cached);

const doc = await db.documents.findOne({ _id: id });
await redis.setex(`doc:${id}`, 3600, JSON.stringify(doc));
```

## Database Optimization

### Query Optimization

```javascript
// Use projection to limit fields
db.documents.find(
  { workspaceId: id },
  { projection: { encryptedContent: 0 } }
).limit(50);

// Use hints for index usage
db.documents.find({ workspaceId: id }).hint({ workspaceId: 1 });
```

### Aggregation Pipeline

```javascript
// Efficient aggregation
db.documents.aggregate([
  { $match: { workspaceId: ObjectId(id) } },
  { $project: { encryptedContent: 0 } },
  { $sort: { updatedAt: -1 } },
  { $limit: 50 }
]);
```

## Caching Strategies

### Browser Caching

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

### API Response Caching

```typescript
// Cache API responses
export async function GET(request: Request) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

## Monitoring Performance

### Web Vitals

```typescript
// Track Core Web Vitals
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
  // Send to analytics
}
```

### MongoDB Profiling

```bash
# Enable profiling
mongosh
use 4diary
db.setProfilingLevel(1, { slowms: 100 })

# Check slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

## Scaling Strategies

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
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

### CDN Integration

Use CDN for static assets:
- Vercel Edge Network (automatic)
- Cloudflare
- AWS CloudFront

## Best Practices

1. **Minimize Bundle Size**: Use tree-shaking, remove unused deps
2. **Optimize Images**: WebP format, proper sizing
3. **Enable Compression**: Gzip/Brotli in Nginx
4. **Database Indexes**: Index frequently queried fields
5. **Connection Pooling**: Reuse database connections
6. **Caching**: Cache at multiple levels
7. **Monitoring**: Track metrics and optimize bottlenecks

## Benchmarks

**Target Metrics**:
- Page Load: < 2s
- Time to Interactive: < 3s
- First Contentful Paint: < 1s
- API Response: < 200ms

## Next Steps

- Review [Architecture Overview](../architecture/architecture.md)
- Check [Deployment Guide](../architecture/deployment.md)
- See [Self-Hosting Guide](./self-hosting.md)

---

**Last Updated**: November 2025  
**Target**: 90+ Lighthouse score
