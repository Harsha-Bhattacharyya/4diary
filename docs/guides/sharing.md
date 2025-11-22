# Sharing & Collaboration Guide

Learn how to securely share your encrypted documents with others while maintaining privacy.

## Overview

4Diary's sharing feature allows you to share encrypted documents with anyone via temporary links. The sharing system is designed with **privacy-first principles**:

- 🔒 **End-to-End Encryption**: Shared documents remain encrypted
- ⏰ **Ephemeral Links**: Automatic expiration after TTL
- 🔑 **Key-in-URL**: Encryption key embedded in share link
- 🚫 **Revocable**: Instantly invalidate share tokens
- 🎯 **Granular Permissions**: View-only or edit access

## How Sharing Works

### The Sharing Architecture

1. **Share Token Creation**: A unique token is generated and stored in Redis
2. **Key Inclusion**: Document encryption key is included in the share URL
3. **Time-Limited**: Token expires automatically (default: 24 hours)
4. **Server-Blind**: Server cannot decrypt shared content
5. **Client Decryption**: Recipient's browser decrypts using URL key

### Security Model

```
[Your Browser] → Encrypted Document → [Server] → Share Token
                       ↓
                  Encryption Key
                       ↓
               [Share URL] → [Recipient] → Decryption → View/Edit
```

**Key Points**:
- Server stores: Encrypted document + Share token metadata
- Server never sees: Encryption keys or plaintext content
- URL contains: Token ID + Encryption key (in fragment)
- Recipient needs: Complete URL to access content

## Creating Share Links

### Basic Sharing

1. Open the document you want to share
2. Click the **"Share"** button (🔗 icon in toolbar)
3. Configure sharing options:
   - **Permission Level**: View or Edit
   - **Expiration Time**: 1 hour to 24 hours
4. Click **"Generate Link"**
5. Copy the share URL

### Permission Levels

#### View-Only Access

**Recipient Can**:
- ✅ Read document content
- ✅ Use Reader Mode
- ✅ See document metadata (title, emoji)
- ✅ View creation/modification dates

**Recipient Cannot**:
- ❌ Edit document content
- ❌ Change document title or emoji
- ❌ Delete the document
- ❌ Create new share links
- ❌ See document owner information

#### Edit Access

**Recipient Can**:
- ✅ Everything in View-Only
- ✅ Modify document content
- ✅ Edit in the BlockNote editor
- ✅ Save changes to the document

**Recipient Cannot**:
- ❌ Delete the document
- ❌ Change document metadata (folder, tags)
- ❌ Create new share links
- ❌ Access other documents in workspace

### Expiration Times

Choose how long the share link remains valid:

| Duration | Best For |
|----------|----------|
| **1 hour** | Quick collaboration sessions |
| **3 hours** | Short meetings or review cycles |
| **6 hours** | Half-day workshops |
| **12 hours** | Full workday access |
| **24 hours** | Default, good for most use cases |

> **⚠️ Important**: Links automatically expire. Recipients lose access after TTL, even if they have the URL.

## Sharing Step-by-Step

### Share a Regular Document

1. **Open Document**
   ```
   Navigate to: workspace/[workspace-id]/docs/[document-id]
   ```

2. **Access Share Menu**
   - Click the **"🔗 Share"** button in top-right toolbar
   - Share dialog opens

3. **Configure Options**
   - Select permission: **"View Only"** or **"Can Edit"**
   - Choose expiration: **1h - 24h** slider
   - Optionally add internal note (not shared)

4. **Generate Link**
   - Click **"Generate Share Link"**
   - Link is created in Redis
   - URL appears in dialog

5. **Copy and Share**
   - Click **"Copy Link"** button
   - Paste in email, chat, or message
   - Recipient can access immediately

### Share a Kanban Board

1. Open the Kanban board
2. Click **"Share"** button (same as documents)
3. Select **"View Only"** for read-only board viewing
4. Or select **"Can Edit"** to allow card management
5. Generate and copy the link

**Edit Permissions for Boards Include**:
- Moving cards between columns
- Adding new cards
- Editing card content
- Creating new columns (if enabled)

### Share Quick Notes

Quick notes must be saved to workspace before sharing:

1. Open Quick Note (Ctrl+Q)
2. Click **"Save to Workspace"**
3. Quick note becomes a regular document
4. Use standard sharing flow from workspace

## Managing Shared Links

### View Active Shares

1. Open the document
2. Click **"Share"** button
3. Select **"Manage Shares"** tab
4. See list of active share tokens:
   - Creation date
   - Expiration date
   - Permission level
   - Number of accesses (if tracked)

### Revoke Share Access

**Revoke Single Share**:
1. Go to **"Manage Shares"**
2. Find the share token
3. Click **"Revoke"**
4. Confirm revocation
5. Link becomes invalid immediately

**Revoke All Shares**:
1. Go to **"Manage Shares"**
2. Click **"Revoke All"**
3. Confirm action
4. All share links for this document become invalid

> **⚡ Instant Effect**: Revocation takes effect immediately. Existing viewers are logged out on their next request.

### Extend Share Duration

Share links cannot be extended. To provide longer access:

1. Revoke the existing share
2. Create a new share with longer TTL
3. Send the new link to recipients

## Receiving Shared Documents

### Accessing a Share Link

1. **Receive URL**: Get the share link from sender
2. **Open Link**: Click or paste URL in browser
3. **Automatic Decryption**: Page loads and decrypts content
4. **View/Edit**: Interact based on permission level

### Share URL Structure

```
https://4diary.app/share/{token}#{encryption-key}
```

**Components**:
- `{token}`: Redis token ID for authentication
- `#{encryption-key}`: Base64-encoded encryption key (client-side only)

> **🔒 Security**: The `#` (fragment) means encryption key is never sent to server.

### What Recipients See

**Document View**:
- Document title and emoji
- Full BlockNote editor (read-only or editable)
- Document metadata (created date, etc.)
- **"Read-only"** badge (if view-only)
- No access to workspace or other documents

**No Account Required**:
- Recipients don't need a 4Diary account
- No sign-up or login
- Direct access via URL

### Making Edits (Edit Permission)

If you have edit permission:

1. Open the shared document
2. Click in the editor to start typing
3. Changes save automatically (auto-save enabled)
4. See **"Saving..."** indicator while saving
5. See **"Saved at [time]"** when complete

**Edit Limitations**:
- Cannot change document title or emoji
- Cannot delete the document
- Cannot access document settings
- Cannot create new share links

## Privacy & Security

### What Gets Shared

**Included in Share**:
- ✅ Document content (encrypted)
- ✅ Document title
- ✅ Document emoji
- ✅ Creation date
- ✅ Last modified date

**NOT Included in Share**:
- ❌ Your email or user information
- ❌ Other documents in workspace
- ❌ Document folder or organization
- ❌ Document tags
- ❌ Edit history or versions

### Encryption in Sharing

**How Encryption Works**:

1. **Document Encryption**: Content encrypted with document key
2. **Key in URL**: Document key included in URL fragment (`#key`)
3. **Server Blindness**: Server stores token but cannot decrypt
4. **Client Decryption**: Recipient's browser uses URL key to decrypt
5. **Edit Re-encryption**: Edited content re-encrypted before saving

**Security Properties**:
- 🔒 Server cannot read shared documents
- 🔑 Only URL holders can decrypt
- 🚫 No plaintext on server
- ✅ Same encryption as your private documents

### Best Practices

#### Sharing Safely

1. **Use Shortest TTL**: Choose minimum duration needed
2. **Revoke When Done**: Remove access after collaboration ends
3. **Verify Recipients**: Only share with trusted parties
4. **Use View-Only**: Default to read-only unless editing needed
5. **Avoid Public Posting**: Don't post share URLs publicly

#### URL Security

```
✅ GOOD:
- Send via encrypted messaging (Signal, WhatsApp)
- Share via email (with TLS)
- DM on secure platforms

❌ BAD:
- Post on public forums
- Tweet or post on social media
- Paste in public Slack channels
- Share in unencrypted emails
```

#### For Sensitive Content

**Extra Precautions**:
1. Use 1-hour expiration for very sensitive data
2. Revoke immediately after viewing
3. Create view-only shares (never edit)
4. Ask recipient to confirm receipt before revoking
5. Consider sharing via secure channel first

## Collaboration Workflows

### Document Review

**Scenario**: Get feedback on a document

1. Create document with draft content
2. Share with **view-only** permission, 24-hour TTL
3. Reviewers read and provide feedback externally
4. Revoke share after review period
5. Incorporate feedback into document

### Real-Time Editing

**Scenario**: Collaborative writing session

1. Share document with **edit** permission
2. Use 3-6 hour TTL for session duration
3. Both parties edit simultaneously
4. Auto-save keeps content in sync
5. Revoke after session completes

### Team Project Management

**Scenario**: Share Kanban board with team

1. Create board with project tasks
2. Share with **edit** permission, 24-hour TTL
3. Team members move cards and add tasks
4. Renew share daily for ongoing projects
5. Archive board when project completes

### External Client Sharing

**Scenario**: Share deliverable with client

1. Prepare final document
2. Share with **view-only**, 24-hour TTL
3. Client reviews content
4. Extend share if more time needed
5. Revoke after client approval

### Quick Information Sharing

**Scenario**: Share meeting notes quickly

1. Take notes during meeting
2. Generate 1-hour view-only share
3. Share link in meeting chat
4. Participants reference during discussion
5. Auto-expires after meeting

## Troubleshooting

### "Share Link Invalid"

**Possible Causes**:
- ✓ Link has expired (check TTL)
- ✓ Share was revoked by owner
- ✓ Token malformed (copy error)
- ✓ Redis connection issue

**Solutions**:
1. Request new share link from owner
2. Verify entire URL was copied (including `#key`)
3. Check expiration time with sender

### "Failed to Decrypt Document"

**Possible Causes**:
- ✓ Encryption key missing from URL
- ✓ URL truncated (key lost)
- ✓ Browser blocked fragment access

**Solutions**:
1. Request complete URL including `#` and everything after
2. Try copying URL again
3. Use different browser if issue persists

### Changes Not Saving

**Possible Causes**:
- ✓ View-only permission (expected)
- ✓ Network connectivity issues
- ✓ Session expired

**Solutions**:
1. Verify you have edit permission
2. Check network connection
3. Request new share link if expired
4. Copy content and create new document if needed

### Share Button Disabled

**Possible Causes**:
- ✓ Redis not configured
- ✓ Document not saved yet
- ✓ Feature disabled by self-hoster

**Solutions**:
1. Ensure Redis is running (check `.env.local`)
2. Save document first before sharing
3. Contact administrator if self-hosted

## Limitations & Considerations

### Current Limitations

- **No Simultaneous Editing**: Last save wins (no operational transform)
- **No Edit History**: Can't see who made what changes
- **No User Avatars**: Anonymous editing even with edit permission
- **No Comments**: Can't add inline comments or suggestions
- **No Notifications**: No alerts when shared document is edited
- **Redis Required**: Sharing feature needs Redis backend

### Future Enhancements

Planned improvements for sharing:

- 🔄 Real-time collaborative editing
- 👤 User presence indicators
- 💬 Inline comments and suggestions
- 📊 Share analytics (view count, etc.)
- 🔔 Edit notifications
- 📎 Attach files to shared documents
- 🔗 Share collections (multiple documents)

## Rate Limits

To prevent abuse, share token creation is rate-limited:

| Limit Type | Value |
|------------|-------|
| **Per User** | 10 shares per hour |
| **Per Document** | 5 active shares simultaneously |
| **Total** | 100 shares per workspace per day |

> **Note**: Limits apply to token creation, not access. Once created, unlimited people can access (until expiry/revocation).

## Self-Hosting Considerations

### Redis Configuration

Sharing requires Redis for token storage:

```env
# .env.local
REDIS_URL=redis://localhost:6379
```

**Without Redis**:
- Share feature is disabled
- Share button hidden
- Alternative: Use export + manual sharing

### Custom TTL Limits

Self-hosters can configure maximum TTL:

```typescript
// lib/redis.ts
const MAX_SHARE_TTL = 24 * 60 * 60; // 24 hours (customize)
```

### Security Headers

Add security headers for shared pages:

```typescript
// next.config.ts
headers: [
  {
    source: '/share/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
    ],
  },
],
```

## Next Steps

- Learn about [Export & Backup](./export-backup.md) for alternative sharing
- Read [Security & Privacy](./security-privacy.md) for encryption details
- Explore [Kanban Boards](./kanban.md) for team task management
- Master [Editor Guide](./editor.md) for collaborative editing

---

**Last Updated**: November 2025  
**Feature Status**: ✅ Available in v0.1.0-alpha (requires Redis)
