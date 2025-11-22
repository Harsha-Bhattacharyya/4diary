# Database Schema

Complete database schema documentation for 4Diary's MongoDB collections.

## Overview

4Diary uses MongoDB for storing encrypted documents and user data. All document content is **encrypted client-side** before being stored in the database.

### Collections

- **workspaces**: User workspaces and authentication
- **documents**: Encrypted documents (docs, boards, quick notes)
- **templates**: Document templates
- **analytics_events**: Privacy-respecting analytics

### Redis Storage

- **shares**: Ephemeral share tokens with TTL

## Workspaces Collection

Stores user accounts and workspace information.

### Schema

```typescript
interface Workspace {
  _id: ObjectId;                    // MongoDB document ID
  email: string;                     // User email (unique)
  passwordHash: string;              // bcrypt hashed password
  encryptedMasterKey: string;        // Encrypted master key (base64)
  createdAt: Date;                   // Account creation timestamp
  updatedAt: Date;                   // Last update timestamp
  settings?: WorkspaceSettings;      // Optional user settings
}

interface WorkspaceSettings {
  theme?: 'leather' | 'dark';        // UI theme preference
  language?: string;                 // Language preference
  notifications?: boolean;           // Email notifications
  autoSave?: boolean;                // Auto-save enabled (default: true)
  autoSaveInterval?: number;         // Auto-save interval (ms)
}
```

### Indexes

```javascript
db.workspaces.createIndex({ email: 1 }, { unique: true });
db.workspaces.createIndex({ createdAt: 1 });
```

### Example Document

```json
{
  "_id": ObjectId("654a1b2c3d4e5f6789abcdef"),
  "email": "user@example.com",
  "passwordHash": "$2b$10$rX8p...hash...YzMw",
  "encryptedMasterKey": "U2FsdGVkX1+...encrypted...==",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-11-22T15:45:30.000Z"),
  "settings": {
    "theme": "leather",
    "autoSave": true,
    "autoSaveInterval": 500
  }
}
```

### Field Details

**email**:
- Unique identifier for user
- Used for login
- Lowercase, validated format

**passwordHash**:
- bcrypt hash with salt
- Never stored in plaintext
- Cost factor: 10 rounds

**encryptedMasterKey**:
- Master key encrypted with password (planned v0.2.0)
- Currently base64 encoded (v0.1.0-alpha)
- Used to decrypt document keys

## Documents Collection

Stores all encrypted documents, Kanban boards, and quick notes.

### Schema

```typescript
interface Document {
  _id: ObjectId;                     // MongoDB document ID
  workspaceId: ObjectId;             // Reference to workspace
  type: 'doc' | 'board' | 'quick';   // Document type
  encryptedTitle: string;            // Encrypted document title
  encryptedContent: string;          // Encrypted document content
  encryptedKey: string;              // Encrypted document key
  folder?: string;                   // Folder name (optional)
  emoji?: string;                    // Emoji icon (optional)
  tags?: string[];                   // Tags array (optional)
  favorite?: boolean;                // Favorited flag
  archived?: boolean;                // Archived flag
  createdAt: Date;                   // Creation timestamp
  updatedAt: Date;                   // Last modification timestamp
  metadata?: DocumentMetadata;       // Additional metadata
}

interface DocumentMetadata {
  wordCount?: number;                // Approximate word count
  charCount?: number;                // Character count
  lastEditedBy?: string;             // Last editor (for shared docs)
  version?: number;                  // Document version
}
```

### Indexes

```javascript
// Primary indexes
db.documents.createIndex({ workspaceId: 1, createdAt: -1 });
db.documents.createIndex({ workspaceId: 1, type: 1 });
db.documents.createIndex({ workspaceId: 1, favorite: 1 });
db.documents.createIndex({ workspaceId: 1, archived: 1 });
db.documents.createIndex({ workspaceId: 1, folder: 1 });

// Performance indexes
db.documents.createIndex({ workspaceId: 1, updatedAt: -1 });
db.documents.createIndex({ workspaceId: 1, tags: 1 });
```

### Example Documents

#### Regular Document

```json
{
  "_id": ObjectId("654a1b2c3d4e5f6789abc123"),
  "workspaceId": ObjectId("654a1b2c3d4e5f6789abcdef"),
  "type": "doc",
  "encryptedTitle": "7Hj9sP2k...encrypted...==",
  "encryptedContent": "U2FsdGVkX1+tY...large encrypted blob...==",
  "encryptedKey": "8J2eHx...encrypted doc key...==",
  "folder": "Work",
  "emoji": "📝",
  "tags": ["meeting", "project-alpha"],
  "favorite": true,
  "archived": false,
  "createdAt": ISODate("2024-11-20T09:15:00.000Z"),
  "updatedAt": ISODate("2024-11-22T14:30:00.000Z"),
  "metadata": {
    "wordCount": 1250,
    "charCount": 7800,
    "version": 3
  }
}
```

#### Kanban Board

```json
{
  "_id": ObjectId("654a1b2c3d4e5f6789abc456"),
  "workspaceId": ObjectId("654a1b2c3d4e5f6789abcdef"),
  "type": "board",
  "encryptedTitle": "9Km4sL7n...encrypted...==",
  "encryptedContent": "U2FsdGVkX1+...board data...==",
  "encryptedKey": "5N8jPx...encrypted key...==",
  "folder": "Projects",
  "emoji": "📊",
  "tags": ["sprint-23", "development"],
  "favorite": false,
  "archived": false,
  "createdAt": ISODate("2024-11-18T10:00:00.000Z"),
  "updatedAt": ISODate("2024-11-22T16:45:00.000Z"),
  "metadata": {
    "version": 12
  }
}
```

### Encrypted Content Structure

The `encryptedContent` field contains:

```typescript
// Decrypted board structure (example)
{
  "columns": [
    {
      "id": "col_1",
      "title": "To Do",
      "cards": [
        {
          "id": "card_1",
          "title": "Task title",
          "description": "Task details"
        }
      ]
    }
  ]
}
```

### Document Type Details

**type: "doc"**:
- Regular text documents
- Rich text content (BlockNote JSON)
- Most common type

**type: "board"**:
- Kanban boards
- Column and card structure
- Task management

**type: "quick"**:
- Quick notes (legacy)
- Simple text content
- Converted to "doc" on save

## Templates Collection

Pre-defined document templates for quick creation.

### Schema

```typescript
interface Template {
  _id: ObjectId;                     // MongoDB document ID
  name: string;                      // Template name
  description: string;               // Template description
  category: string;                  // Category (work, personal, etc.)
  emoji: string;                     // Template icon
  content: object;                   // Template content (BlockNote JSON)
  type: 'doc' | 'board';            // Template type
  isPublic: boolean;                 // Public template flag
  createdBy?: string;                // Creator (system or user)
  createdAt: Date;                   // Creation timestamp
  updatedAt: Date;                   // Last update timestamp
  usageCount?: number;               // Times used counter
}
```

### Indexes

```javascript
db.templates.createIndex({ category: 1 });
db.templates.createIndex({ isPublic: 1 });
db.templates.createIndex({ createdAt: -1 });
```

### Example Template

```json
{
  "_id": ObjectId("654a1b2c3d4e5f6789abc789"),
  "name": "Meeting Notes",
  "description": "Structure for capturing meeting notes",
  "category": "work",
  "emoji": "📋",
  "content": [
    {
      "type": "heading",
      "level": 1,
      "content": "Meeting Notes"
    },
    {
      "type": "heading",
      "level": 2,
      "content": "Attendees"
    },
    {
      "type": "bulletList",
      "content": []
    }
  ],
  "type": "doc",
  "isPublic": true,
  "createdBy": "system",
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00.000Z"),
  "usageCount": 142
}
```

## Analytics Events Collection

Privacy-respecting usage analytics (optional).

### Schema

```typescript
interface AnalyticsEvent {
  _id: ObjectId;                     // MongoDB document ID
  eventType: string;                 // Event type
  timestamp: Date;                   // Event timestamp
  sessionId: string;                 // Anonymous session ID
  metadata?: object;                 // Event-specific metadata (no PII)
}
```

### Indexes

```javascript
db.analytics_events.createIndex({ timestamp: -1 });
db.analytics_events.createIndex({ eventType: 1, timestamp: -1 });
db.analytics_events.createIndex({ sessionId: 1 });

// TTL index (auto-delete after 90 days)
db.analytics_events.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 }
);
```

### Example Events

```json
{
  "_id": ObjectId("654a1b2c3d4e5f6789abcabc"),
  "eventType": "document_created",
  "timestamp": ISODate("2024-11-22T15:30:00.000Z"),
  "sessionId": "anon_8j7h6g5f4d3s2a1",
  "metadata": {
    "type": "doc",
    "hasTemplate": false
  }
}
```

### Event Types

- `document_created`
- `document_edited`
- `document_deleted`
- `board_created`
- `share_created`
- `export_initiated`
- `template_used`

## Redis Share Tokens

Ephemeral share tokens stored in Redis with TTL.

### Structure

```typescript
interface ShareToken {
  token: string;                     // Unique token ID
  documentId: string;                // Document ObjectId (string)
  permission: 'view' | 'edit';       // Access permission
  createdAt: number;                 // Unix timestamp
  expiresAt: number;                 // Unix timestamp
  createdBy: string;                 // Workspace ID
}
```

### Redis Keys

```
share:{token} → JSON serialized ShareToken
```

### Example

```redis
Key: share:abc123xyz789
Value: {
  "token": "abc123xyz789",
  "documentId": "654a1b2c3d4e5f6789abc123",
  "permission": "view",
  "createdAt": 1700658600,
  "expiresAt": 1700745000,
  "createdBy": "654a1b2c3d4e5f6789abcdef"
}
TTL: 86400 seconds (24 hours)
```

### Redis Commands Used

```redis
# Create share token
SET share:{token} {json} EX {ttl}

# Get share token
GET share:{token}

# Delete share token (revoke)
DEL share:{token}

# Check if token exists
EXISTS share:{token}
```

## Migrations

### Version 0.1.0-alpha → 0.2.0

Planned migrations:

```javascript
// Migration: Add PBKDF2 salt to workspaces
db.workspaces.updateMany(
  { salt: { $exists: false } },
  {
    $set: {
      salt: null,  // Will be generated on next login
      keyDerivation: 'pbkdf2'
    }
  }
);

// Migration: Add metadata to documents
db.documents.updateMany(
  { metadata: { $exists: false } },
  {
    $set: {
      metadata: {
        version: 1
      }
    }
  }
);
```

## Database Maintenance

### Backup Strategy

```bash
# Daily backup
mongodump --uri="mongodb://localhost:27017/4diary" \
  --out=/backups/4diary-$(date +%Y%m%d)

# Compress backup
tar -czf 4diary-$(date +%Y%m%d).tar.gz \
  /backups/4diary-$(date +%Y%m%d)
```

### Index Maintenance

```javascript
// Rebuild indexes
db.documents.reIndex();
db.workspaces.reIndex();

// Check index usage
db.documents.aggregate([
  { $indexStats: {} }
]);
```

### Cleanup Old Data

```javascript
// Archive old documents (manual)
db.documents.updateMany(
  {
    updatedAt: { $lt: new Date('2023-01-01') },
    archived: false
  },
  {
    $set: { archived: true }
  }
);

// Analytics auto-cleanup (TTL index handles this)
// Old events automatically deleted after 90 days
```

## Performance Optimization

### Query Patterns

**Workspace Documents List**:
```javascript
db.documents.find({
  workspaceId: ObjectId("..."),
  archived: false
}).sort({ updatedAt: -1 }).limit(50);
```

**Folder Documents**:
```javascript
db.documents.find({
  workspaceId: ObjectId("..."),
  folder: "Work"
}).sort({ createdAt: -1 });
```

**Favorite Documents**:
```javascript
db.documents.find({
  workspaceId: ObjectId("..."),
  favorite: true
}).sort({ updatedAt: -1 });
```

### Index Coverage

All common queries are covered by indexes:
- Workspace + filter queries
- Sorting by dates
- Folder and tag filtering

## Security Considerations

### Encrypted Fields

**Always Encrypted**:
- Document title
- Document content
- Document keys

**Never Encrypted** (Required for functionality):
- Document ID
- Workspace ID
- Timestamps
- Folder names
- Tags
- Type
- Flags (favorite, archived)

### Access Control

```javascript
// Verify user owns document before any operation
async function verifyAccess(docId, workspaceId) {
  const doc = await db.documents.findOne({
    _id: ObjectId(docId),
    workspaceId: ObjectId(workspaceId)
  });
  
  if (!doc) {
    throw new Error('Access denied');
  }
  
  return doc;
}
```

## Database Configuration

### Recommended Settings

```javascript
// MongoDB connection options
{
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
}
```

### Production Setup

```yaml
# MongoDB replica set recommended
replication:
  replSetName: "rs0"

# Enable authentication
security:
  authorization: enabled

# Set up backups
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

# Performance tuning
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100
```

## Next Steps

- Review [Architecture Overview](./architecture.md) for system design
- Check [API Reference](./api-reference.md) for endpoints
- Read [Security Architecture](./security-architecture.md) for encryption
- See [Deployment Guide](./deployment.md) for production setup

---

**Last Updated**: November 2025  
**Schema Version**: v0.1.0-alpha
