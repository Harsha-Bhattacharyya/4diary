# Copilot Instructions for 4diary

## Project Overview

4diary is a privacy-focused, end-to-end encrypted note-taking application built with Next.js. It provides a Notion-like editing experience with military-grade encryption, ensuring zero-knowledge architecture where the server never sees unencrypted content.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (ES2020)
- **Styling**: Tailwind CSS v4
- **Editor**: BlockNote
- **Database**: MongoDB
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Animation**: Framer Motion
- **Export**: JSZip
- **Runtime**: Node.js 20+

## Architecture Principles

### Encryption Flow
1. Master keys are generated in the browser and stored in IndexedDB
2. Each document has its own encryption key
3. Document keys are encrypted with the master key
4. Document content is encrypted with the document key
5. Only encrypted data reaches the server (zero-knowledge architecture)

### Security Requirements
- All encryption operations MUST happen client-side
- Never send unencrypted content to the server
- Use AES-256-GCM for all encryption
- Use PBKDF2 with 100,000 iterations for password-based key derivation
- Master keys must never leave the browser
- Server must have zero knowledge of content

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── workspace/         # Main workspace pages
│   ├── templates/         # Template pages
│   ├── settings/          # Settings pages
│   └── about/             # About page
├── components/            # React components
│   ├── editor/           # BlockNote editor components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility libraries
│   ├── crypto/           # Encryption utilities (encrypt, decrypt, keys)
│   ├── mongodb.ts        # Database connection
│   ├── export.ts         # Export functionality
│   └── templates.ts      # Template management
└── public/               # Static assets
```

## Coding Standards

### TypeScript
- Use TypeScript for all new files
- TypeScript strict mode is disabled (legacy codebase)
- Target ES2020
- Use type annotations for function parameters and return types
- Prefer interfaces over types for object shapes
- Use the `@/*` path alias for imports from project root

### React/Next.js
- Use functional components with hooks
- Use the App Router (not Pages Router)
- Server Components by default, use `'use client'` only when necessary
- Use Server Actions for data mutations
- Keep components focused and single-purpose
- Extract reusable UI components to `components/ui/`

### Styling
- Use Tailwind CSS v4 utility classes
- Custom theme colors: `leather-*` (100-500 range) for the Frutiger Aero design
- Use GlassCard component for glass morphism effects
- Use FruityButton component for consistent button styling
- Use FruityBackground component for consistent backgrounds

### File Naming
- React components: PascalCase (e.g., `GlassCard.tsx`)
- Utility files: camelCase (e.g., `encrypt.ts`)
- Pages: lowercase with hyphens (e.g., `about/page.tsx`)
- API routes: lowercase with hyphens (e.g., `api/workspace/route.ts`)

### Code Organization
- Keep encryption logic in `lib/crypto/`
- Database operations in `lib/mongodb.ts` or API routes
- Reusable UI components in `components/ui/`
- Editor-specific components in `components/editor/`
- Use Server Actions for form submissions and data mutations

## Database Schema

### Collections
- **workspaces**: User workspaces with encrypted master keys
- **documents**: Encrypted documents with searchable metadata
- **templates**: Document templates
- **analytics_events**: Privacy-respecting usage analytics

### Important Fields
- Store encrypted content in `encryptedContent` field
- Store encryption metadata (IV, salt) separately
- Keep searchable metadata unencrypted (title, createdAt, etc.)
- Use ISO timestamps for date fields

## Development Workflow

### Setup
```bash
npm install                    # Install dependencies
cp .env.local.example .env.local  # Create environment file
# Update .env.local with MongoDB URI
npm run dev                    # Start development server
```

### Available Scripts
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Linting
- Use ESLint with Next.js configuration
- Follow Next.js core web vitals rules
- TypeScript ESLint rules enabled
- Run `npm run lint` before committing

### Testing
- Currently no automated tests in the repository
- Manually test encryption/decryption flows
- Verify zero-knowledge architecture (check network tab)
- Test export functionality with sample data

## Best Practices

### When Adding Features
1. Consider security implications (encryption, data privacy)
2. Maintain zero-knowledge architecture
3. Test with actual encrypted data
4. Verify data never leaves browser unencrypted
5. Update relevant documentation

### When Modifying Encryption
1. Review existing encryption patterns in `lib/crypto/`
2. Never weaken security for convenience
3. Test encryption/decryption roundtrips
4. Verify IV and salt are properly stored
5. Ensure backward compatibility with existing encrypted data

### When Working with Database
1. Use MongoDB connection pooling (`lib/mongodb.ts`)
2. Store only encrypted content on server
3. Keep metadata searchable (don't encrypt titles, dates)
4. Use proper indexes for performance
5. Handle connection errors gracefully

### When Creating UI Components
1. Follow Frutiger Aero design system
2. Use glass morphism effects via GlassCard
3. Maintain consistent spacing and colors
4. Support both light and dark themes
5. Ensure responsive design (mobile-first)

## Common Patterns

### Encrypting Data
```typescript
import { encryptDocument } from '@/lib/crypto/encrypt';

const encryptedData = await encryptDocument(
  documentContent,
  documentKey,
  masterKey
);
```

### Decrypting Data
```typescript
import { decryptDocument } from '@/lib/crypto/decrypt';

const decryptedContent = await decryptDocument(
  encryptedData,
  documentKey,
  masterKey
);
```

### Creating Server Actions
```typescript
'use server';

export async function createDocument(formData: FormData) {
  const db = await connectToDatabase();
  // ... handle encrypted data storage
}
```

### Using Glass Morphism
```tsx
import GlassCard from '@/components/ui/GlassCard';

<GlassCard hover>
  <h3>Card Title</h3>
  <p>Card content</p>
</GlassCard>
```

## Environment Variables

Required in `.env.local`:
- `MONGODB_URI` - MongoDB connection string

## Docker Deployment

- Dockerfile uses multi-stage build for optimization
- `docker-compose.yml` includes Next.js, MongoDB, and Redis
- Use `--profile debug` flag to include Mongo Express
- Update credentials before production deployment

## Important Notes

- **Privacy First**: Always maintain zero-knowledge architecture
- **No Tests**: Repository currently has no test suite
- **Self-Hosted**: Designed for self-hosting with Docker
- **Encryption**: Use Web Crypto API exclusively, never Node crypto
- **TypeScript**: Strict mode disabled, but use types where possible
- **Export**: Support both Markdown and ZIP exports
- **Templates**: Pre-built templates in `/templates` route

## Getting Help

- Check README.md for setup instructions
- Review existing components in `components/` for patterns
- Examine `lib/crypto/` for encryption examples
- MongoDB connection logic in `lib/mongodb.ts`
- BlockNote editor usage in `components/editor/`
