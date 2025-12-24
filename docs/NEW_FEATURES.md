# New Features - Settings & Security Enhancements

This document describes the new features added to 4diary to enhance security, customization, and user control.

## Quick Navigation

Jump to a specific feature:
- [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
- [Encryption Toggle](#encryption-toggle)
- [Note Background Colors](#note-background-colors)
- [Read-Only Notes](#read-only-notes)
- [Archive Notes](#archive-notes)
- [Password-Protected Notes](#password-protected-notes)
- [API Reference](#api-reference)

## Table of Contents

1. [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
2. [Encryption Toggle](#encryption-toggle)
3. [Note Background Colors](#note-background-colors)
4. [Read-Only Notes](#read-only-notes)
5. [Archive Notes](#archive-notes)
6. [Password-Protected Notes](#password-protected-notes)
7. [API Reference](#api-reference)
8. [Database Schema Changes](#database-schema-changes)
9. [Self-Hosting Considerations](#self-hosting-considerations)
10. [Security Best Practices](#security-best-practices)
11. [Future Enhancements](#future-enhancements)
12. [Troubleshooting](#troubleshooting)
13. [Support](#support)

---

## Two-Factor Authentication (2FA)

### Overview

4diary now supports TOTP-based two-factor authentication using authenticator apps like Google Authenticator, Authy, or similar applications.

### Features

- **QR Code Setup**: Easy setup by scanning a QR code with your authenticator app
- **Backup Codes**: 10 single-use backup codes for account recovery
- **Rate Limiting**: Protection against brute force attacks (5 attempts per 15 minutes)
- **Self-Hosted Compatible**: Works with self-hosted instances without external dependencies

### How to Enable 2FA

1. Navigate to **Settings** > **Security**
2. Click **Setup 2FA**
3. Scan the QR code with your authenticator app
4. Save the backup codes in a secure location
5. Enter the 6-digit code from your app to verify
6. Click **Verify & Enable**

### How to Disable 2FA

1. Navigate to **Settings** > **Security**
2. Click **Disable 2FA**
3. Enter your account password to confirm
4. 2FA will be disabled and secrets removed

### Login with 2FA

When 2FA is enabled:

1. Enter your username and password as usual
2. System detects 2FA is enabled
3. Enter the 6-digit code from your authenticator app
4. Alternatively, use a backup code if needed

### API Endpoints

- `POST /api/auth/2fa/setup` - Initialize 2FA setup
- `POST /api/auth/2fa/verify` - Verify TOTP token
- `POST /api/auth/2fa/enable` - Enable 2FA after verification
- `POST /api/auth/2fa/disable` - Disable 2FA (requires password)
- `GET /api/auth/2fa/status` - Check 2FA status
- `POST /api/auth/2fa/login` - Complete login with 2FA

---

## Encryption Toggle

### Overview

Control whether new documents are encrypted. This setting allows you to disable encryption for performance or compatibility reasons while maintaining the option to use encryption.

### Important Notes

- **Existing Documents**: Already encrypted documents remain encrypted
- **New Documents**: Only affects newly created documents
- **Default**: Encryption is enabled by default
- **Warning**: Disabling encryption is not recommended for sensitive data

### How to Use

1. Navigate to **Settings** > **Security**
2. Click the **End-to-End Encryption** toggle
3. Confirm the warning dialog
4. New documents will be created unencrypted (if disabled)

### API Endpoints

- `GET /api/settings` - Get user settings including encryption status
- `PUT /api/settings` - Update encryption preference

---

## Note Background Colors

### Overview

Customize your notes with background colors, similar to Google Keep. Choose from 12 preset colors to visually organize and categorize your notes.

### Available Colors

1. **Default** - No color (white/system default)
2. **Coral** - #f28b82
3. **Peach** - #fbbc04
4. **Sand** - #fff475
5. **Mint** - #ccff90
6. **Sage** - #a7ffeb
7. **Fog** - #cbf0f8
8. **Storm** - #aecbfa
9. **Dusk** - #d7aefb
10. **Blossom** - #fdcfe8
11. **Clay** - #e6c9a8
12. **Chalk** - #e8eaed

### How to Use

1. Open a document
2. Click the **⚙️** settings icon in the toolbar
3. Scroll to **Display Settings**
4. Click on a color square to apply it
5. The background color is applied immediately

### Implementation

- Colors are stored in `metadata.backgroundColor`
- Applied as inline styles to the editor container
- Persists across sessions

---

## Read-Only Notes

### Overview

Lock notes to prevent accidental edits. Perfect for archived information, reference documents, or completed work.

### Features

- **Visual Indicator**: A "🔒 Read-Only" badge appears when mode is active
- **Editor Disabled**: Editing and toolbar are disabled
- **Reversible**: Can be toggled on/off at any time

### How to Use

1. Open a document
2. Click the **⚙️** settings icon
3. Scroll to **Note State**
4. Toggle **Read-Only Mode**
5. The document becomes non-editable

### Implementation

- Stored in `document.readOnly` field
- Editor's `editable` prop set to `false` when active
- Toolbar hidden when read-only
- Visual badge displayed in top-right corner

---

## Archive Notes

### Overview

Hide notes from your main workspace without deleting them. Archived notes are removed from the document list but remain accessible.

### Features

- **Hide from List**: Archived notes don't appear in the main document list
- **Auto-Close**: Document closes when archived
- **Reversible**: Can be unarchived anytime via API or document settings

### How to Use

1. Open a document
2. Click the **⚙️** settings icon
3. Scroll to **Note State**
4. Toggle **Archive Note**
5. The document closes and is removed from the list

### Implementation

- Stored in `document.archived` field
- Documents with `archived: true` filtered from main query
- To view archived documents, query with `?archived=true`

### API Query

```javascript
// Get archived documents
fetch(`/api/documents?workspaceId=${workspaceId}&userId=${userId}&archived=true`)
```

---

## Password-Protected Notes

### Overview

Add an extra layer of security to individual notes by requiring a password to access them.

### Features

- **Password Hashing**: Passwords hashed with bcrypt (10 rounds)
- **Per-Document**: Each note can have its own password
- **Independent**: Works independently of account password and 2FA

### How to Use

1. Open a document
2. Click the **⚙️** settings icon
3. Scroll to **Password Protection**
4. Click **Set Password**
5. Enter and confirm your password
6. The note is now password-protected

### Removing Password Protection

1. Open the note settings
2. Click **Remove Password**
3. Password protection is removed

### API Endpoints

- `POST /api/documents/[id]/lock` - Set password protection
- `POST /api/documents/[id]/unlock` - Remove password protection
- `POST /api/documents/[id]/verify-password` - Verify password

### Security Notes

- Passwords are hashed with bcrypt (cost factor: 10)
- Server never stores plaintext passwords
- Password verification happens server-side
- Compatible with self-hosted deployments

---

## API Reference

### Settings API

#### Get User Settings

```http
GET /api/settings
```

**Response:**
```json
{
  "encryptionEnabled": true
}
```

#### Update User Settings

```http
PUT /api/settings
Content-Type: application/json

{
  "encryptionEnabled": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

### 2FA API

#### Setup 2FA

```http
POST /api/auth/2fa/setup
```

**Response:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["CODE1", "CODE2", ...],
  "manualEntryKey": "JBSWY3DPEHPK3PXP"
}
```

#### Enable 2FA

```http
POST /api/auth/2fa/enable
Content-Type: application/json

{
  "token": "123456"
}
```

#### Disable 2FA

```http
POST /api/auth/2fa/disable
Content-Type: application/json

{
  "password": "your-password"
}
```

#### Check 2FA Status

```http
GET /api/auth/2fa/status
```

**Response:**
```json
{
  "enabled": true,
  "hasSecret": true,
  "backupCodesCount": 8
}
```

### Document Lock API

#### Lock Document

```http
POST /api/documents/{id}/lock
Content-Type: application/json

{
  "password": "document-password"
}
```

#### Unlock Document

```http
POST /api/documents/{id}/unlock
```

#### Verify Password

```http
POST /api/documents/{id}/verify-password
Content-Type: application/json

{
  "password": "document-password"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Password verified successfully"
}
```

---

## Database Schema Changes

### User Model

```typescript
interface User {
  // Existing fields...
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
  encryptionEnabled?: boolean;
}
```

### Document Model

```typescript
interface DocumentType {
  // Existing fields...
  readOnly?: boolean;
  passwordProtected?: boolean;
  passwordHash?: string;
  metadata: {
    // Existing fields...
    backgroundColor?: string;
  };
}
```

---

## Self-Hosting Considerations

All features are designed to work with self-hosted instances:

- **No External APIs**: 2FA uses standard TOTP protocol
- **Local Storage**: All secrets stored in your MongoDB instance
- **No Cloud Dependencies**: Backup codes and QR codes generated locally
- **Docker Compatible**: All features work in containerized deployments

---

## Security Best Practices

1. **Enable 2FA**: Adds significant security to your account
2. **Save Backup Codes**: Store them securely offline
3. **Use Strong Passwords**: For both account and document protection
4. **Keep Encryption On**: Unless you have specific reasons to disable it
5. **Regular Backups**: Export your workspace periodically
6. **Update Regularly**: Keep 4diary updated for security patches

---

## Future Enhancements

Potential improvements for future releases:

- [ ] Password prompt modal when opening locked notes
- [ ] 2FA for individual note access
- [ ] Biometric authentication support
- [ ] Hardware key (FIDO2) support
- [ ] Archived notes view in sidebar
- [ ] Color-coded document list
- [ ] Batch operations (archive multiple, change colors)

---

## Troubleshooting

### 2FA Issues

**Problem**: Lost authenticator app access
**Solution**: Use one of your backup codes to log in, then disable and re-setup 2FA

**Problem**: QR code won't scan
**Solution**: Use the manual entry key displayed below the QR code

**Problem**: "Too many failed attempts" error
**Solution**: Wait 15 minutes for the rate limit to reset

### Encryption Issues

**Problem**: Can't decrypt old documents after disabling encryption
**Solution**: Encrypted documents remain encrypted. Re-enable encryption or use export to decrypt.

### Password Protection Issues

**Problem**: Forgot note password
**Solution**: Unfortunately, there's no recovery mechanism. Document content cannot be accessed without the password.

---

## Support

For issues, questions, or feature requests:

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/Harsha-Bhattacharyya/4diary/issues)
- **Discussions**: [Join the community](https://github.com/Harsha-Bhattacharyya/4diary/discussions)
- **Documentation**: [Full documentation](https://github.com/Harsha-Bhattacharyya/4diary/tree/main/docs)

---

## License

BSD-3-Clause License. See [LICENSE](../LICENSE) file for details.
