# Security & Privacy Guide

Understanding how 4Diary protects your data with end-to-end encryption and zero-knowledge architecture.

## Privacy Philosophy

4Diary is built on a foundation of **privacy by design**:

- 🔒 **Client-Side Encryption**: All encryption happens in your browser
- 🚫 **Zero Knowledge**: Server never sees your unencrypted content
- 🔑 **You Control Keys**: Master keys never leave your device
- 📖 **Open Source**: Transparent, auditable code
- 🏠 **Self-Hostable**: Full control over your data

## How Encryption Works

### Overview

```
[Your Document] → [Browser Encryption] → [Encrypted Data] → [Server]
                                    ↓
                            [AES-256-GCM]
                                    ↓
                            [Your Master Key]
                                    ↓
                            [Your Password]
```

**Key Points**:
- Encryption happens entirely in your browser
- Server receives only encrypted data
- Decryption only happens in your browser
- No one (including server admin) can read your content

### The Encryption Process

#### 1. Master Key Generation

When you create a workspace:

```
1. You create account with email + password
2. Browser generates random master key (256-bit)
3. Master key encrypted with your password
4. Encrypted master key stored in IndexedDB
5. Original key stays in browser memory
```

**Important**: Your password is never sent to the server!

#### 2. Document Key Generation

For each document:

```
1. Browser generates unique document key (256-bit)
2. Document key encrypted with master key
3. Encrypted document key stored with document
4. Document content encrypted with document key
```

**Result**: Each document has its own encryption key

#### 3. Encryption Algorithm

**AES-256-GCM** (Advanced Encryption Standard with Galois/Counter Mode):

- **Key Size**: 256 bits (highest standard)
- **Mode**: GCM (authenticated encryption)
- **Authentication**: Prevents tampering
- **Standard**: NIST-approved, military-grade
- **Implementation**: Browser's Web Crypto API

**Why AES-256-GCM?**:
- ✅ **Strong**: Virtually unbreakable with current technology
- ✅ **Fast**: Hardware-accelerated in modern CPUs
- ✅ **Authenticated**: Detects if data was modified
- ✅ **Standardized**: Widely tested and trusted
- ✅ **Native**: Built into browsers (Web Crypto API)

#### 4. Content Encryption

```javascript
// Simplified encryption flow
async function encryptDocument(content, documentKey) {
  // 1. Convert content to bytes
  const data = new TextEncoder().encode(content);
  
  // 2. Generate random IV (initialization vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // 3. Encrypt with AES-256-GCM
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128
    },
    documentKey,
    data
  );
  
  // 4. Return IV + encrypted data
  return { iv, encrypted };
}
```

**Security Features**:
- Random IV for each encryption (never reused)
- 128-bit authentication tag (detects tampering)
- Constant-time operations (prevents timing attacks)

### What Gets Encrypted

#### Encrypted Content

✅ **Document Content**:
- Full text of all documents
- BlockNote editor JSON
- Kanban board data (columns, cards)
- Document descriptions

✅ **Document Data**:
- Content blocks
- Formatting information
- Embedded data

#### Unencrypted Metadata

❌ **Server-Visible Metadata**:
- Document ID
- Creation date
- Last modified date
- Document owner (workspace ID)
- Document type (doc/board/quick)

> **Why?** Metadata enables features like sorting, filtering, and efficient queries without decryption.

❌ **Searchable Fields**:
- Document title (encrypted separately, searchable via client-side decryption)
- Folder names (for organization)
- Tags (for filtering)
- Emoji icons

> **Note**: Search is planned to be client-side only (decrypt, then search locally).

## Key Management

### Master Key Storage

Your master key is stored in **IndexedDB**:

**Current (v0.1.0-alpha)**:
- Master key base64-encoded
- Stored in browser's IndexedDB
- Not encrypted at rest (browser-level security)

**Planned (v0.2.0+)**:
- Master key encrypted with password-derived key
- PBKDF2 with 100,000+ iterations
- Salt stored separately
- More secure at-rest protection

### Key Derivation

**Password-Based Key Derivation (Planned)**:

```javascript
// Future implementation
async function deriveKeyFromPassword(password, salt) {
  // 1. Convert password to key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  
  // 2. Derive encryption key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // 100,000 iterations
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  
  return key;
}
```

**Benefits**:
- Slows down brute-force attacks
- Unique salt per user
- Industry-standard approach

### Document Keys

Each document has its own key:

**Generation**:
```javascript
// Generate unique 256-bit key for document
const documentKey = await crypto.subtle.generateKey(
  {
    name: "AES-GCM",
    length: 256
  },
  true, // extractable (for encryption with master key)
  ["encrypt", "decrypt"]
);
```

**Storage**:
- Document key encrypted with master key
- Stored in document metadata
- Decrypted when document is opened

**Rotation**:
- Keys can be rotated per document
- Re-encryption with new key
- Old key permanently deleted

## Zero-Knowledge Architecture

### What is Zero-Knowledge?

**Definition**: The server has **zero knowledge** of your content. It cannot:
- ❌ Read your documents
- ❌ Decrypt your data
- ❌ Access your encryption keys
- ❌ See your plaintext content
- ❌ Provide data to third parties (only encrypted data exists)

### How It Works

**Traditional Note Apps**:
```
[Your Device] → [Plaintext] → [Server] → [Database]
                                 ↓
                         [Can read everything]
```

**4Diary's Zero-Knowledge**:
```
[Your Device] → [Encrypted] → [Server] → [Database]
                     ↓
            [Only encrypted data]
                     ↓
            [Server cannot decrypt]
```

### Server's Perspective

What the server sees:

```json
{
  "id": "doc_abc123xyz",
  "workspaceId": "ws_user456",
  "type": "doc",
  "createdAt": "2024-11-22T10:30:00Z",
  "updatedAt": "2024-11-22T15:45:00Z",
  "encryptedContent": "U2FsdGVkX1+... [long encrypted string]",
  "encryptedKey": "8J2eHx... [encrypted document key]",
  "encryptedTitle": "7Hj9s... [encrypted title]"
}
```

**Server knows**: Document exists, when created/updated  
**Server doesn't know**: Title, content, what it's about

### Implications

**For Privacy**:
- ✅ No server-side search (your queries are private)
- ✅ No content analysis (AI can't read your docs)
- ✅ No data mining (no ads based on content)
- ✅ No third-party access (can't be subpoenaed for content)

**For Functionality**:
- ⚠️ Server can't index documents for search
- ⚠️ Can't generate thumbnails or previews
- ⚠️ No server-side document processing
- ⚠️ Collaboration requires key sharing

## Threat Model

### What 4Diary Protects Against

#### ✅ Protected Against

**Server Compromise**:
- Attacker gains database access
- Can't decrypt documents (no keys)
- Can only access encrypted data

**Network Sniffing**:
- HTTPS/TLS protects data in transit
- Encrypted payloads even if TLS broken
- Keys never transmitted

**Malicious Administrator**:
- Admin has database access
- Cannot decrypt content
- Cannot impersonate users (for decryption)

**Data Breach**:
- Database leaked publicly
- Only encrypted data exposed
- Keys not in database

**Government Subpoena**:
- Server can only provide encrypted data
- Cannot decrypt on demand
- You control the keys

#### ⚠️ Partially Protected

**Browser Compromise**:
- Malicious extension could access keys in memory
- XSS attacks could steal data
- **Mitigation**: Use trusted browser, review extensions

**Phishing Attacks**:
- Fake login page could steal password
- **Mitigation**: Verify URL, use password manager

**Shoulder Surfing**:
- Someone watches you type
- **Mitigation**: Private workspace, screen privacy filter

#### ❌ Not Protected Against

**Local Device Compromise**:
- Malware on your computer
- Keylogger captures password
- **Mitigation**: Antivirus, OS security updates

**Physical Device Access**:
- Someone has your unlocked device
- Can access open session
- **Mitigation**: Lock screen, auto-lock timeout

**Social Engineering**:
- Tricked into sharing password
- **Mitigation**: Never share credentials

**Weak Passwords**:
- Easily guessable password
- Brute-force attack on exported data
- **Mitigation**: Use strong, unique password

## Best Practices

### Password Security

#### Choose a Strong Password

**Requirements**:
- Minimum 12 characters (recommend 16+)
- Mix of uppercase, lowercase, numbers, symbols
- Not in common password lists
- Unique to 4Diary (never reuse)

**Good Examples**:
```
✅ correct-horse-battery-staple-blue-42
✅ MyD!ary2024$SecureNotes#Top
✅ 8j#mK9$pL2@xN5&qR7*vT3
```

**Bad Examples**:
```
❌ password123
❌ mydiary
❌ 4diary2024
❌ 123456789
```

#### Use a Password Manager

Recommended password managers:
- 1Password
- Bitwarden (open source)
- KeePassXC (offline, open source)
- LastPass
- Dashlane

**Benefits**:
- Generate strong passwords
- Never forget passwords
- Unique per service
- Encrypted vault

### Device Security

#### Keep Software Updated

Update regularly:
- Operating system
- Web browser
- 4Diary app (if applicable)
- Security patches

#### Use Antivirus/Anti-Malware

Protect your device:
- Install reputable security software
- Keep definitions updated
- Run regular scans
- Avoid suspicious downloads

#### Enable Full Disk Encryption

Encrypt your hard drive:
- **Windows**: BitLocker
- **macOS**: FileVault
- **Linux**: LUKS

**Why?** Protects data if device is stolen/lost

### Session Security

#### Auto-Lock

Configure browser to:
- Clear data on exit (optional)
- Lock after inactivity
- Require password on wake

#### Logout When Done

Always logout on:
- Public/shared computers
- Work computers (if personal use)
- Before leaving device unattended

#### Avoid Public Wi-Fi

Be cautious on public networks:
- Use VPN if possible
- Verify HTTPS connection
- Avoid sensitive work

### Sharing Security

#### Share Link Practices

When sharing documents:
- ✅ Use shortest TTL needed
- ✅ Share via encrypted messaging
- ✅ Revoke access when done
- ✅ Verify recipient before sharing
- ❌ Don't post publicly
- ❌ Don't share in unencrypted email

#### Review Active Shares

Regularly:
- Check active share tokens
- Revoke unused/old shares
- Update expiration times
- Document who has access

### Export Security

#### Encrypt Exports

Exported files are **not encrypted**:

**Recommended**:
```bash
# Encrypt ZIP with password
7z a -p -mhe=on workspace-encrypted.7z workspace.zip

# Or use GPG
gpg --symmetric --cipher-algo AES256 workspace.zip
```

#### Secure Storage

Store exports:
- ✅ Encrypted external drive
- ✅ Password-protected cloud
- ✅ Encrypted backup service
- ❌ Unencrypted USB drive
- ❌ Public cloud without encryption

## Auditing & Verification

### Open Source Transparency

4Diary is fully open source:

**Verify the Code**:
- GitHub repository: https://github.com/Harsha-Bhattacharyya/4diary
- Review encryption implementation
- Check for backdoors
- Audit security practices

**Key Files**:
```
lib/crypto/
├── encrypt.ts      # Encryption logic
├── decrypt.ts      # Decryption logic
├── keys.ts         # Key generation
└── keyManager.ts   # Key management
```

### Browser DevTools Inspection

Verify encryption in action:

1. Open document in 4Diary
2. Open DevTools (F12)
3. Go to Network tab
4. Save document
5. Inspect request payload:
   - See encrypted content
   - Verify no plaintext

**What You'll See**:
```json
{
  "content": "U2FsdGVkX1+tY...", // Encrypted, not readable
  "key": "8J2eHx...",            // Encrypted document key
  "title": "7Hj9s..."            // Encrypted title
}
```

### IndexedDB Inspection

Check master key storage:

1. Open DevTools
2. Go to Application tab
3. Expand IndexedDB → 4diary
4. View keys table
5. See encrypted master key

**Security Note**: Keys are in IndexedDB (browser-level security). Future versions will add additional encryption layer.

## Compliance & Regulations

### GDPR Compliance

4Diary helps with GDPR:

✅ **Right to Access**: Export your data anytime  
✅ **Right to Portability**: Markdown/JSON export  
✅ **Right to Erasure**: Delete workspace/documents  
✅ **Data Minimization**: Only necessary metadata stored  
✅ **Privacy by Design**: Encryption built-in

### Data Residency

For self-hosters:
- Choose your server location
- Control where data lives
- Comply with local regulations
- Meet organizational requirements

## Incident Response

### If You Suspect Compromise

**Immediate Actions**:
1. Change password immediately
2. Logout all sessions
3. Revoke all share tokens
4. Export data for backup
5. Review account activity

**Investigation**:
1. Check browser extensions
2. Scan device for malware
3. Review network logs
4. Check for unauthorized access

**Prevention**:
1. Enable 2FA (when available)
2. Use password manager
3. Update security software
4. Review sharing practices

### Lost/Stolen Device

**If Device is Lost**:
1. Remote wipe (if enabled)
2. Change 4Diary password remotely
3. Revoke active sessions
4. Monitor for suspicious activity

**Prevention**:
- Enable device encryption
- Set auto-lock timeout
- Use strong device passcode
- Enable remote wipe capability

## Future Security Enhancements

Planned improvements:

- 🔐 **PBKDF2 Key Derivation**: 100,000+ iterations
- 🔑 **Two-Factor Authentication**: TOTP support
- 📱 **Biometric Unlock**: Fingerprint/Face ID
- 🔔 **Security Audit Log**: Track all access
- 🛡️ **Advanced Threat Protection**: Anomaly detection
- 🔒 **Hardware Security Keys**: YubiKey support
- 📧 **Email Alerts**: Suspicious activity notifications
- 🔄 **Key Rotation**: Automated key rotation
- 🔍 **Security Scanning**: Integrated vulnerability scanning

## FAQs

**Q: Can the 4Diary team read my notes?**  
A: No. Even with full server access, we cannot decrypt your content. Only you have the keys.

**Q: What if I forget my password?**  
A: Your data cannot be recovered. Your password is the key to your encryption. Choose a strong password and store it securely.

**Q: Is 4Diary end-to-end encrypted?**  
A: Yes. Encryption happens in your browser before data leaves your device.

**Q: Can government agencies access my data?**  
A: They can subpoena the server, but will only receive encrypted data. Without your password, it's not readable.

**Q: Is my data safe if 4Diary gets hacked?**  
A: Yes. Attackers would only get encrypted data. With strong encryption (AES-256), it's practically impossible to decrypt without keys.

**Q: How is this different from other note apps?**  
A: Most note apps can decrypt your data (even if "encrypted"). 4Diary uses zero-knowledge encryption - we literally cannot access your content.

**Q: Can I trust the encryption?**  
A: Yes. We use industry-standard AES-256-GCM via browser's Web Crypto API. Code is open source for verification.

## Next Steps

- Read [Export & Backup](./export-backup.md) for data safety
- Learn about [Self-Hosting](../advanced/self-hosting.md) for maximum control
- Check [Architecture](../architecture/security-architecture.md) for technical details
- Review [Troubleshooting](./troubleshooting.md) for common issues

---

**Last Updated**: November 2025  
**Security Version**: v0.1.0-alpha (Enhanced security in v0.2.0+)

**Trust but Verify**: Our code is open source. Review it, audit it, contribute to it.
