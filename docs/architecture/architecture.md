# Architecture Overview

Understanding 4Diary's system design, components, and technical architecture.

## System Overview

4Diary is a modern web application built with a **privacy-first, zero-knowledge architecture**. The system is designed around the principle that user data should be encrypted client-side and remain inaccessible to the server.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
├─────────────────────────────────────────────────────────┤
│  React Components  │  Web Crypto API  │  IndexedDB      │
│  ─────────────────────────────────────────────────────  │
│  Next.js App Router │ Encryption Layer │ Key Management │
│  ─────────────────────────────────────────────────────  │
│  BlockNote Editor  │  Framer Motion   │  React Hooks   │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTPS/TLS
┌─────────────────────────────────────────────────────────┐
│                   Server (Next.js API)                   │
├─────────────────────────────────────────────────────────┤
│  API Routes        │  Authentication  │  Session Mgmt   │
│  ─────────────────────────────────────────────────────  │
│  Document Service  │  Workspace Svc   │  Share Service  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌──────────────────┐   ┌──────────────────┐
│     MongoDB      │   │      Redis       │
│  (Encrypted Data)│   │  (Share Tokens)  │
└──────────────────┘   └──────────────────┘
```

## Core Principles

### 1. Privacy by Design

**Client-Side Encryption**:
- All encryption happens in the browser
- Server never sees plaintext data
- Zero-knowledge architecture

**Key Management**:
- Master keys generated client-side
- Keys stored in IndexedDB
- Never transmitted to server

### 2. Modern Stack

**Framework**:
- Next.js 16 (App Router)
- React 19
- TypeScript 5.9

**Styling**:
- Tailwind CSS v4
- Custom leather theme
- Responsive design

**Database**:
- MongoDB for encrypted documents
- Redis for ephemeral tokens
- IndexedDB for client keys

### 3. Performance

**Optimization**:
- Server-side rendering (SSR)
- Static generation where possible
- Code splitting
- Lazy loading

**Caching**:
- Browser caching
- API response caching
- Redis for session data

## Technology Stack

### Frontend

#### Core Framework
- **Next.js 16**: React framework with App Router
- **React 19**: UI library with hooks
- **TypeScript 5.9**: Type safety

#### UI & Styling
- **Tailwind CSS v4**: Utility-first CSS
- **Framer Motion**: Animations
- **Custom Components**: Reusable UI elements

#### Editor
- **BlockNote 0.42**: Rich text editor
- **Markdown Support**: Writing productivity
- **Custom Extensions**: Enhanced functionality

#### State Management
- **React Hooks**: Local state
- **Context API**: Global state
- **IndexedDB**: Client-side persistence

#### Encryption
- **Web Crypto API**: Browser-native crypto
- **AES-256-GCM**: Encryption algorithm
- **PBKDF2**: Key derivation (planned)

### Backend

#### Server Framework
- **Next.js API Routes**: RESTful endpoints
- **Edge Functions**: Serverless deployment
- **Middleware**: Authentication, logging

#### Database
- **MongoDB 7.0**: Document database
  - Stores encrypted documents
  - Workspace metadata
  - User accounts

- **Redis 5.8**: In-memory store
  - Share tokens with TTL
  - Session data
  - Rate limiting

#### Authentication
- **JWT (Jose)**: Token-based auth
- **bcrypt**: Password hashing
- **HTTP-only cookies**: Session storage

### DevOps

#### Development
- **ESLint**: Code linting
- **Playwright**: E2E testing
- **Docker**: Containerization

#### Deployment
- **Vercel**: Recommended platform
- **Docker Compose**: Self-hosting
- **PM2**: Process management

#### Monitoring
- **Sentry**: Error tracking
- **Custom Analytics**: Privacy-respecting

## Project Structure

```
4diary/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication group
│   │   ├── login/
│   │   └── signup/
│   ├── workspace/               # Main workspace
│   │   ├── [id]/               # Workspace ID routes
│   │   │   ├── docs/           # Document editor
│   │   │   └── board/          # Kanban boards
│   │   └── page.tsx            # Workspace dashboard
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── documents/          # Document CRUD
│   │   ├── workspaces/         # Workspace management
│   │   ├── shares/             # Share token management
│   │   └── templates/          # Template endpoints
│   ├── share/                  # Shared document view
│   ├── templates/              # Template browser
│   ├── settings/               # User settings
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
│
├── components/                  # React components
│   ├── editor/                 # Editor components
│   │   ├── BlockEditor.tsx     # Main editor wrapper
│   │   ├── FormattingToolbar.tsx
│   │   └── ReaderMode.tsx
│   ├── kanban/                 # Kanban components
│   │   ├── Board.tsx
│   │   ├── Column.tsx
│   │   └── Card.tsx
│   ├── ui/                     # UI components
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── TopMenu.tsx         # Top navigation
│   │   ├── Modal.tsx           # Modal dialogs
│   │   └── Button.tsx          # Button components
│   └── shared/                 # Shared utilities
│
├── lib/                        # Core libraries
│   ├── crypto/                 # Encryption layer
│   │   ├── encrypt.ts          # Encryption functions
│   │   ├── decrypt.ts          # Decryption functions
│   │   ├── keys.ts             # Key generation
│   │   └── keyManager.ts       # Key management
│   ├── mongodb.ts              # MongoDB connection
│   ├── redis.ts                # Redis connection
│   ├── documentService.ts      # Document operations
│   ├── workspaceService.ts     # Workspace operations
│   ├── templateService.ts      # Template operations
│   ├── export.ts               # Export functionality
│   ├── analytics.ts            # Analytics tracking
│   └── templates.ts            # Template definitions
│
├── public/                     # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── tests/                      # Test suites
│   ├── e2e/                   # End-to-end tests
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
│
├── docs/                       # Documentation
│   ├── guides/                # User guides
│   ├── architecture/          # Technical docs
│   ├── advanced/              # Advanced topics
│   └── development/           # Developer docs
│
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD pipelines
│   └── ISSUE_TEMPLATE/        # Issue templates
│
├── next.config.ts              # Next.js configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── playwright.config.ts        # Playwright configuration
├── docker-compose.yml          # Docker setup
├── Dockerfile                  # Docker image
├── package.json                # Dependencies
└── README.md                   # Project overview
```

## Component Architecture

### Client-Side Components

#### Editor System

```typescript
// BlockEditor Component
BlockEditor
├── FormattingToolbar
│   ├── TextFormatButtons
│   └── BlockFormatButtons
├── BlockNoteView
│   ├── ContentBlocks
│   └── CustomExtensions
└── AutoSave
    ├── ChangeDetection
    └── SaveIndicator
```

**Responsibilities**:
- Rich text editing
- Markdown support
- Auto-save functionality
- Format preservation

#### Workspace Dashboard

```typescript
// Workspace Component
WorkspaceDashboard
├── Sidebar
│   ├── FolderTree
│   ├── DocumentList
│   └── QuickActions
├── DocumentGrid
│   ├── DocumentCard
│   └── BoardCard
└── TopMenu
    ├── SearchBar
    ├── UserMenu
    └── QuickNote
```

**Responsibilities**:
- Document organization
- Navigation
- Quick actions
- User settings

#### Kanban Board

```typescript
// Kanban Component
KanbanBoard
├── BoardHeader
│   ├── TitleEditor
│   └── BoardActions
├── ColumnContainer
│   ├── Column
│   │   ├── ColumnHeader
│   │   └── CardList
│   │       └── Card
│   │           ├── CardContent
│   │           └── CardActions
│   └── AddColumnButton
└── DragDropContext
```

**Responsibilities**:
- Task management
- Drag and drop
- Column organization
- Card operations

### Server-Side Services

#### Document Service

```typescript
// lib/documentService.ts
class DocumentService {
  create(workspace, data)
  read(docId, workspace)
  update(docId, data)
  delete(docId, workspace)
  list(workspace, filters)
  search(workspace, query)
}
```

**Responsibilities**:
- CRUD operations
- Access control
- Validation
- Error handling

#### Encryption Service

```typescript
// lib/crypto/
class EncryptionService {
  generateMasterKey()
  encryptDocument(content, key)
  decryptDocument(encrypted, key)
  encryptKey(key, masterKey)
  decryptKey(encrypted, masterKey)
}
```

**Responsibilities**:
- Key generation
- Encryption/decryption
- Key management
- Security enforcement

## Data Flow

### Document Creation

```
1. User creates new document
   ├── UI: Click "New Document"
   └── React: Trigger create action

2. Browser generates document key
   ├── Crypto: Generate 256-bit key
   └── Memory: Store in state

3. User types content
   ├── Editor: BlockNote handles input
   └── State: Content in component state

4. Auto-save triggers
   ├── Debounce: 500ms after last change
   └── Encrypt: Content → encrypted

5. Send to server
   ├── API: POST /api/documents
   ├── Payload: Encrypted content + key
   └── Headers: Auth token

6. Server processes
   ├── Auth: Verify user
   ├── Validate: Check data
   └── Store: MongoDB insert

7. Server responds
   ├── Status: 201 Created
   ├── Data: Document ID
   └── Client: Update UI

8. Update local state
   ├── State: Document saved
   └── UI: Show "Saved" indicator
```

### Document Retrieval

```
1. User opens document
   ├── UI: Click document
   └── Navigate: /workspace/[id]/docs/[docId]

2. Request document
   ├── API: GET /api/documents/[id]
   └── Headers: Auth token

3. Server retrieves
   ├── Auth: Verify access
   ├── Query: MongoDB find
   └── Return: Encrypted data

4. Client receives
   ├── Network: Encrypted payload
   └── Memory: Store encrypted

5. Retrieve master key
   ├── IndexedDB: Get master key
   └── Memory: Load into state

6. Decrypt document key
   ├── Crypto: Decrypt with master key
   └── Memory: Document key

7. Decrypt content
   ├── Crypto: Decrypt with doc key
   └── Memory: Plaintext content

8. Render editor
   ├── BlockNote: Load content
   └── UI: Display document
```

### Sharing Flow

```
1. User clicks Share
   ├── UI: Open share modal
   └── Select: Permission + TTL

2. Generate share token
   ├── Client: Create token ID
   ├── Server: Store in Redis
   └── TTL: Set expiration

3. Build share URL
   ├── Base: /share/[token]
   ├── Fragment: #[encryption-key]
   └── URL: Complete share link

4. Copy to clipboard
   ├── Browser: navigator.clipboard
   └── UI: Show "Copied" message

5. Recipient opens link
   ├── Navigate: /share/[token]
   └── API: Verify token

6. Server validates
   ├── Redis: Check token exists
   ├── TTL: Verify not expired
   └── Return: Document ID

7. Client retrieves
   ├── API: GET document
   └── Extract: Key from URL fragment

8. Decrypt and display
   ├── Crypto: Decrypt with URL key
   └── UI: Show document
```

## Security Architecture

### Authentication Flow

```
1. User signup/login
   ├── Input: Email + Password
   └── Client: Hash password

2. Send to server
   ├── API: POST /api/auth/login
   └── Payload: Email + hashed password

3. Server validates
   ├── MongoDB: Find user
   ├── bcrypt: Verify password
   └── JWT: Generate token

4. Set session
   ├── Cookie: HTTP-only, secure
   ├── TTL: 30 days
   └── Response: User data

5. Client stores
   ├── State: User authenticated
   └── IndexedDB: Master key
```

### Encryption Layers

```
Layer 1: Transport (HTTPS/TLS)
├── Protects data in transit
└── Browser ↔ Server

Layer 2: Document Encryption (AES-256-GCM)
├── Protects content at rest
└── Client-side only

Layer 3: Key Encryption
├── Document keys encrypted with master key
└── Master key in IndexedDB

Layer 4: Password Protection (Planned)
├── Master key encrypted with password-derived key
└── PBKDF2 + Salt
```

## Scalability

### Horizontal Scaling

**Application Servers**:
- Stateless Next.js instances
- Load balancer distribution
- Auto-scaling based on load

**Database Scaling**:
- MongoDB replica sets
- Read replicas for queries
- Sharding for large datasets

**Cache Scaling**:
- Redis cluster
- Multiple Redis instances
- Consistent hashing

### Performance Optimization

**Client-Side**:
- Code splitting
- Lazy loading
- Service workers (planned)
- IndexedDB caching

**Server-Side**:
- API response caching
- Database query optimization
- Connection pooling
- Rate limiting

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────┐
│         Load Balancer (nginx)           │
└─────────────────────────────────────────┘
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
┌───────────────┐       ┌───────────────┐
│  Next.js App  │       │  Next.js App  │
│   Instance 1  │       │   Instance 2  │
└───────────────┘       └───────────────┘
        ↓                       ↓
        └───────────┬───────────┘
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
┌───────────────┐       ┌───────────────┐
│   MongoDB     │       │     Redis     │
│  Primary +    │       │    Cluster    │
│   Replicas    │       │               │
└───────────────┘       └───────────────┘
```

### Deployment Options

**Option 1: Vercel** (Recommended)
- One-click deployment
- Automatic scaling
- Edge functions
- Built-in CDN

**Option 2: Docker** (Self-hosting)
- Full control
- Custom configuration
- Own infrastructure
- Private deployment

**Option 3: Traditional** (VPS)
- PM2 process manager
- nginx reverse proxy
- Manual scaling
- Direct control

## Monitoring & Observability

### Error Tracking

**Sentry Integration**:
- Client-side errors
- Server-side errors
- Performance monitoring
- Release tracking

### Analytics

**Privacy-Respecting**:
- Custom analytics
- No third-party trackers
- Aggregated data only
- No PII collection

### Logs

**Structured Logging**:
- Application logs
- API request logs
- Error logs
- Security logs

## Future Architecture

### Planned Improvements

**Real-Time Collaboration**:
- WebSocket connections
- Operational transformation
- Conflict resolution
- User presence

**Offline Support**:
- Service workers
- IndexedDB full cache
- Sync when online
- Conflict handling

**Mobile Apps**:
- React Native
- Native encryption
- Biometric auth
- Push notifications

**Plugin System**:
- Custom extensions
- Third-party integrations
- API webhooks
- Custom blocks

## Next Steps

- Read [Security Architecture](./security-architecture.md) for encryption details
- Check [Database Schema](./database-schema.md) for data models
- Review [API Reference](./api-reference.md) for endpoints
- See [Deployment Guide](./deployment.md) for production setup

---

**Last Updated**: November 2025  
**Architecture Version**: v0.1.0-alpha
