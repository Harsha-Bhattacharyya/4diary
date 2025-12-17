# API Reference

Complete REST API documentation for 4Diary's backend endpoints.

## Overview

4Diary's API is built with Next.js API Routes, providing a RESTful interface for all application operations. All document content is **encrypted client-side** before being sent to the API.

### Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

### Authentication

Most endpoints require authentication via HTTP-only session cookies set during login.

**Authentication Flow**:
1. Login via `/api/auth/login`
2. Session cookie automatically included in subsequent requests
3. Logout via `/api/auth/logout` to clear session

## Authentication Endpoints

### Sign Up

Create a new user account and workspace.

```http
POST /api/auth/signup
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "workspace": {
    "id": "654a1b2c3d4e5f6789abcdef",
    "email": "user@example.com",
    "createdAt": "2024-11-22T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid email or password format
- `409 Conflict`: Email already exists

### Login

Authenticate and create session.

```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "workspace": {
    "id": "654a1b2c3d4e5f6789abcdef",
    "email": "user@example.com",
    "encryptedMasterKey": "U2FsdGVkX1+..."
  }
}
```

**Sets Cookie**:
```
Set-Cookie: session=<jwt-token>; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `404 Not Found`: User not found

### Logout

End current session.

```http
POST /api/auth/logout
```

**Response** (200 OK):
```json
{
  "success": true
}
```

**Clears Cookie**: Removes session cookie

### Get Session

Check authentication status.

```http
GET /api/auth/session
```

**Response** (200 OK - Authenticated):
```json
{
  "authenticated": true,
  "workspace": {
    "id": "654a1b2c3d4e5f6789abcdef",
    "email": "user@example.com"
  }
}
```

**Response** (200 OK - Not Authenticated):
```json
{
  "authenticated": false
}
```

## Workspace Endpoints

### Get Workspace

Retrieve workspace information.

```http
GET /api/workspaces
```

**Requires**: Authentication

**Response** (200 OK):
```json
{
  "id": "654a1b2c3d4e5f6789abcdef",
  "email": "user@example.com",
  "encryptedMasterKey": "U2FsdGVkX1+...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "settings": {
    "theme": "leather",
    "autoSave": true
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Workspace not found

### Update Workspace Settings

Update user preferences.

```http
PATCH /api/workspaces
```

**Requires**: Authentication

**Request Body**:
```json
{
  "settings": {
    "theme": "leather",
    "autoSave": true,
    "autoSaveInterval": 500
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "workspace": {
    "id": "654a1b2c3d4e5f6789abcdef",
    "settings": {
      "theme": "leather",
      "autoSave": true,
      "autoSaveInterval": 500
    }
  }
}
```

## Document Endpoints

### List Documents

Get all documents in workspace.

```http
GET /api/documents?type={type}&folder={folder}&favorite={bool}&archived={bool}
```

**Requires**: Authentication

**Query Parameters**:
- `type` (optional): Filter by type (`doc`, `board`, `quick`)
- `folder` (optional): Filter by folder name
- `favorite` (optional): Filter favorites (`true`/`false`)
- `archived` (optional): Filter archived (`true`/`false`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)

**Response** (200 OK):
```json
{
  "documents": [
    {
      "id": "654a1b2c3d4e5f6789abc123",
      "workspaceId": "654a1b2c3d4e5f6789abcdef",
      "type": "doc",
      "encryptedTitle": "7Hj9sP2k...",
      "encryptedContent": "U2FsdGVkX1+...",
      "encryptedKey": "8J2eHx...",
      "folder": "Work",
      "emoji": "📝",
      "tags": ["meeting", "project"],
      "favorite": true,
      "archived": false,
      "createdAt": "2024-11-20T09:15:00.000Z",
      "updatedAt": "2024-11-22T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 42,
    "pages": 1
  }
}
```

### Get Document

Retrieve a specific document.

```http
GET /api/documents/{id}
```

**Requires**: Authentication

**Path Parameters**:
- `id`: Document ID

**Response** (200 OK):
```json
{
  "id": "654a1b2c3d4e5f6789abc123",
  "workspaceId": "654a1b2c3d4e5f6789abcdef",
  "type": "doc",
  "encryptedTitle": "7Hj9sP2k...",
  "encryptedContent": "U2FsdGVkX1+...",
  "encryptedKey": "8J2eHx...",
  "folder": "Work",
  "emoji": "📝",
  "tags": ["meeting"],
  "favorite": false,
  "archived": false,
  "createdAt": "2024-11-20T09:15:00.000Z",
  "updatedAt": "2024-11-22T14:30:00.000Z",
  "metadata": {
    "wordCount": 1250,
    "version": 3
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not document owner
- `404 Not Found`: Document not found

### Create Document

Create a new document.

```http
POST /api/documents
```

**Requires**: Authentication

**Request Body**:
```json
{
  "type": "doc",
  "encryptedTitle": "7Hj9sP2k...",
  "encryptedContent": "U2FsdGVkX1+...",
  "encryptedKey": "8J2eHx...",
  "folder": "Work",
  "emoji": "📝",
  "tags": ["meeting"]
}
```

**Response** (201 Created):
```json
{
  "id": "654a1b2c3d4e5f6789abc123",
  "workspaceId": "654a1b2c3d4e5f6789abcdef",
  "type": "doc",
  "encryptedTitle": "7Hj9sP2k...",
  "encryptedContent": "U2FsdGVkX1+...",
  "encryptedKey": "8J2eHx...",
  "folder": "Work",
  "emoji": "📝",
  "tags": ["meeting"],
  "favorite": false,
  "archived": false,
  "createdAt": "2024-11-22T15:30:00.000Z",
  "updatedAt": "2024-11-22T15:30:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: Not authenticated

### Update Document

Update an existing document.

```http
PUT /api/documents/{id}
```

**Requires**: Authentication

**Path Parameters**:
- `id`: Document ID

**Request Body**:
```json
{
  "encryptedTitle": "7Hj9sP2k...",
  "encryptedContent": "U2FsdGVkX1+...",
  "folder": "Personal",
  "emoji": "📖",
  "tags": ["journal"],
  "favorite": true
}
```

**Response** (200 OK):
```json
{
  "id": "654a1b2c3d4e5f6789abc123",
  "workspaceId": "654a1b2c3d4e5f6789abcdef",
  "encryptedTitle": "7Hj9sP2k...",
  "encryptedContent": "U2FsdGVkX1+...",
  "folder": "Personal",
  "emoji": "📖",
  "tags": ["journal"],
  "favorite": true,
  "updatedAt": "2024-11-22T16:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not document owner
- `404 Not Found`: Document not found

### Delete Document

Delete a document permanently.

```http
DELETE /api/documents/{id}
```

**Requires**: Authentication

**Path Parameters**:
- `id`: Document ID

**Response** (200 OK):
```json
{
  "success": true,
  "id": "654a1b2c3d4e5f6789abc123"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not document owner
- `404 Not Found`: Document not found

## Share Endpoints

### Create Share Token

Generate a share link for a document.

```http
POST /api/shares
```

**Requires**: Authentication, Redis

**Request Body**:
```json
{
  "documentId": "654a1b2c3d4e5f6789abc123",
  "permission": "view",
  "ttl": 86400
}
```

**Fields**:
- `documentId`: Document to share
- `permission`: `view` or `edit`
- `ttl`: Time-to-live in seconds (max: 86400 = 24 hours)

**Response** (201 Created):
```json
{
  "token": "abc123xyz789",
  "shareUrl": "/share/abc123xyz789",
  "permission": "view",
  "expiresAt": "2024-11-23T16:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not document owner
- `404 Not Found`: Document not found
- `429 Too Many Requests`: Rate limit exceeded
- `503 Service Unavailable`: Redis not available

### Get Share

Retrieve shared document by token.

```http
GET /api/share?id={token}
```

**Query Parameters**:
- `id`: Share token

**Response** (200 OK):
```json
{
  "document": {
    "id": "654a1b2c3d4e5f6789abc123",
    "encryptedTitle": "7Hj9sP2k...",
    "encryptedContent": "U2FsdGVkX1+...",
    "type": "doc",
    "emoji": "📝",
    "createdAt": "2024-11-20T09:15:00.000Z"
  },
  "permission": "view",
  "expiresAt": "2024-11-23T16:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Invalid or expired token
- `410 Gone`: Share has expired

### Revoke Share Token

Revoke a share token immediately.

```http
DELETE /api/shares/{token}
```

**Requires**: Authentication

**Path Parameters**:
- `token`: Share token to revoke

**Response** (200 OK):
```json
{
  "success": true,
  "token": "abc123xyz789"
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not token owner
- `404 Not Found`: Token not found

### List Active Shares

Get all active shares for a document.

```http
GET /api/shares?documentId={id}
```

**Requires**: Authentication

**Query Parameters**:
- `documentId`: Document ID

**Response** (200 OK):
```json
{
  "shares": [
    {
      "token": "abc123xyz789",
      "permission": "view",
      "createdAt": "2024-11-22T16:00:00.000Z",
      "expiresAt": "2024-11-23T16:00:00.000Z"
    }
  ]
}
```

## Template Endpoints

### List Templates

Get available document templates.

```http
GET /api/templates?category={category}
```

**Query Parameters**:
- `category` (optional): Filter by category (`work`, `personal`, `educational`)

**Response** (200 OK):
```json
{
  "templates": [
    {
      "id": "654a1b2c3d4e5f6789abc789",
      "name": "Meeting Notes",
      "description": "Structure for capturing meeting notes",
      "category": "work",
      "emoji": "📋",
      "type": "doc",
      "content": [...],
      "usageCount": 142
    }
  ]
}
```

### Get Template

Retrieve a specific template.

```http
GET /api/templates/{id}
```

**Path Parameters**:
- `id`: Template ID

**Response** (200 OK):
```json
{
  "id": "654a1b2c3d4e5f6789abc789",
  "name": "Meeting Notes",
  "description": "Structure for capturing meeting notes",
  "category": "work",
  "emoji": "📋",
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "level": 1,
      "content": "Meeting Notes"
    }
  ],
  "usageCount": 142
}
```

## Analytics Endpoints

### Track Event

Log a privacy-respecting analytics event.

```http
POST /api/analytics
```

**Request Body**:
```json
{
  "eventType": "document_created",
  "metadata": {
    "type": "doc",
    "hasTemplate": false
  }
}
```

**Response** (201 Created):
```json
{
  "success": true
}
```

**Note**: No PII is collected. Events are aggregated and auto-deleted after 90 days.

## Embed Preview Endpoints

### Get URL Metadata

Fetch sanitized metadata for URL previews.

```http
GET /api/embed?url={encodedUrl}
```

**Query Parameters**:
- `url`: URL-encoded website URL

**Response** (200 OK):
```json
{
  "title": "Example Website",
  "description": "Website description",
  "image": "https://example.com/image.jpg",
  "url": "https://example.com"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid URL
- `404 Not Found`: URL not accessible

**Security**: All HTML is sanitized to prevent XSS attacks.

## Rate Limiting

Rate limits are enforced per IP address:

| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 10 requests/minute |
| `/api/shares` (POST) | 10 shares/hour |
| `/api/documents` (POST) | 100 creates/hour |
| `/api/documents` (PUT) | 300 updates/hour |
| All other endpoints | 300 requests/hour |

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 285
X-RateLimit-Reset: 1700662800
```

**Rate Limit Response** (429):
```json
{
  "error": "Too Many Requests",
  "retryAfter": 3600
}
```

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details (optional)"
}
```

### Common HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Not authenticated |
| `403` | Forbidden | Authenticated but no access |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists |
| `410` | Gone | Resource expired |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Dependency unavailable |

## CORS Configuration

**Allowed Origins**:
- Production: `https://your-domain.com`
- Development: `http://localhost:3000`

**Allowed Methods**:
```
GET, POST, PUT, DELETE, OPTIONS
```

**Allowed Headers**:
```
Content-Type, Authorization
```

**Credentials**: Allowed (for cookies)

## Security Headers

All API responses include security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Webhooks (Planned)

Future support for webhooks:

```http
POST /api/webhooks
```

Subscribe to events:
- `document.created`
- `document.updated`
- `document.deleted`
- `share.created`
- `share.expired`

## API Versioning

Current version: **v1** (implicit)

Future versions will use URL versioning:
```
/api/v2/documents
```

## Client Libraries

### JavaScript/TypeScript

```typescript
// Example API client usage
import { API } from '@/lib/api';

// Create document
const doc = await API.documents.create({
  type: 'doc',
  encryptedTitle: '...',
  encryptedContent: '...',
  encryptedKey: '...'
});

// Get documents
const docs = await API.documents.list({
  folder: 'Work',
  favorite: true
});

// Create share
const share = await API.shares.create({
  documentId: doc.id,
  permission: 'view',
  ttl: 86400
});
```

### cURL Examples

**Login**:
```bash
curl -X POST https://api.4diary.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' \
  -c cookies.txt
```

**Create Document**:
```bash
curl -X POST https://api.4diary.app/api/documents \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "type": "doc",
    "encryptedTitle": "...",
    "encryptedContent": "...",
    "encryptedKey": "..."
  }'
```

**List Documents**:
```bash
curl -X GET "https://api.4diary.app/api/documents?folder=Work" \
  -b cookies.txt
```

## Testing the API

### Development

```bash
# Start dev server
pnpm run dev

# API available at http://localhost:3000/api
```

### Using Postman

Import the 4Diary Postman collection (coming soon) for pre-configured requests.

### Using Thunder Client (VS Code)

Example request collection available in `.vscode/thunder-tests/`.

## Next Steps

- Review [Architecture Overview](./architecture.md) for system design
- Check [Database Schema](./database-schema.md) for data models
- Read [Security Architecture](./security-architecture.md) for encryption
- See [Deployment Guide](./deployment.md) for production setup

---

**Last Updated**: November 2025  
**API Version**: v1 (implicit)  
**Status**: Production-ready (v0.1.0-alpha)
