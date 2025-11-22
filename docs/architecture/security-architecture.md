# Security Architecture

Deep dive into 4Diary's encryption implementation and security architecture.

## Security Overview

4Diary implements **zero-knowledge, end-to-end encryption** using industry-standard cryptographic primitives. The core principle: **the server never has access to unencrypted user data**.

### Security Layers

```
┌─────────────────────────────────────────────────┐
│  Layer 5: Transport Security (HTTPS/TLS)       │
├─────────────────────────────────────────────────┤
│  Layer 4: Application Security (CORS, CSP)     │
├─────────────────────────────────────────────────┤
│  Layer 3: Document Encryption (AES-256-GCM)    │
├─────────────────────────────────────────────────┤
│  Layer 2: Key Encryption (Master Key)          │
├─────────────────────────────────────────────────┤
│  Layer 1: Password Protection (PBKDF2 Planned) │
└─────────────────────────────────────────────────┘
```

## Cryptographic Primitives

### AES-256-GCM

**Algorithm**: Advanced Encryption Standard with Galois/Counter Mode  
**Key Size**: 256 bits (32 bytes)  
**Mode**: GCM (Galois/Counter Mode)  
**Authentication Tag**: 128 bits

**Why AES-256-GCM?**
- ✅ **NIST Approved**: Federal standard for encryption
- ✅ **Authenticated Encryption**: Prevents tampering (AEAD)
- ✅ **Hardware Accelerated**: AES-NI support in modern CPUs
- ✅ **Parallelizable**: Fast encryption/decryption
- ✅ **Proven Security**: No known practical attacks

**Technical Specifications**:
```typescript
{
  name: "AES-GCM",
  length: 256,              // Key size in bits
  iv: 96,                   // IV size in bits (12 bytes)
  tagLength: 128            // Authentication tag (16 bytes)
}
```

### Web Crypto API

4Diary uses the browser's native Web Crypto API:

**Advantages**:
- Secure random number generation
- Constant-time operations (prevents timing attacks)
- Hardware-backed when available (TPM, Secure Enclave)
- Standard implementation across browsers
- No third-party crypto libraries needed

**Supported Operations**:
- `crypto.subtle.generateKey()`: Key generation
- `crypto.subtle.encrypt()`: Encryption
- `crypto.subtle.decrypt()`: Decryption
- `crypto.subtle.deriveKey()`: Key derivation (PBKDF2)
- `crypto.getRandomValues()`: Secure random generation

## Encryption Architecture

### Master Key Generation

When a user creates an account:

```typescript
async function generateMasterKey(): Promise<CryptoKey> {
  // Generate 256-bit random key
  const masterKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,  // extractable (needed for storage)
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"]
  );
  
  return masterKey;
}
```

**Properties**:
- **Uniqueness**: Each workspace has unique master key
- **Randomness**: Generated from secure CSPRNG
- **Storage**: IndexedDB (encrypted with password in v0.2.0+)
- **Persistence**: Never sent to server
- **Usage**: Encrypts/decrypts document keys

### Document Key Generation

Each document has its own encryption key:

```typescript
async function generateDocumentKey(): Promise<CryptoKey> {
  const documentKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,  // extractable (for wrapping with master key)
    ["encrypt", "decrypt"]
  );
  
  return documentKey;
}
```

**Key Hierarchy**:
```
Master Key (256-bit)
    ↓
    ├─ Document Key 1 (256-bit)
    ├─ Document Key 2 (256-bit)
    ├─ Document Key 3 (256-bit)
    └─ Document Key N (256-bit)
```

**Benefits**:
- **Key Rotation**: Rotate individual document keys without affecting others
- **Selective Sharing**: Share specific documents without exposing master key
- **Isolation**: Compromise of one key doesn't affect others

### Document Encryption Process

```typescript
async function encryptDocument(
  content: string,
  documentKey: CryptoKey
): Promise<EncryptedData> {
  // 1. Convert content to bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  
  // 2. Generate random IV (96 bits for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // 3. Encrypt with AES-256-GCM
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128  // 128-bit authentication tag
    },
    documentKey,
    data
  );
  
  // 4. Return IV + encrypted data
  return {
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encrypted)
  };
}
```

**Security Properties**:
- **Unique IV**: Never reused (critical for GCM security)
- **Authentication**: 128-bit tag prevents tampering
- **Confidentiality**: AES-256 ensures strong encryption
- **Integrity**: GCM mode detects modifications

### Document Decryption Process

```typescript
async function decryptDocument(
  encrypted: EncryptedData,
  documentKey: CryptoKey
): Promise<string> {
  try {
    // 1. Convert from base64
    const iv = base64ToArrayBuffer(encrypted.iv);
    const data = base64ToArrayBuffer(encrypted.data);
    
    // 2. Decrypt with AES-256-GCM
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
        tagLength: 128
      },
      documentKey,
      data
    );
    
    // 3. Convert bytes to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
    
  } catch (error) {
    // Authentication tag verification failed
    throw new Error("Decryption failed: data may be corrupted or tampered");
  }
}
```

**Security Checks**:
- **Tag Verification**: Automatic in GCM mode
- **Exception on Failure**: Throws if tampered or wrong key
- **No Partial Data**: Either complete decryption or failure

### Key Wrapping

Document keys are encrypted with the master key before storage:

```typescript
async function wrapDocumentKey(
  documentKey: CryptoKey,
  masterKey: CryptoKey
): Promise<string> {
  // Generate random IV for wrapping
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Wrap (encrypt) document key with master key
  const wrappedKey = await crypto.subtle.wrapKey(
    "raw",                // Format of key to wrap
    documentKey,          // Key to wrap
    masterKey,            // Wrapping key
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128
    }
  );
  
  // Store IV + wrapped key
  return JSON.stringify({
    iv: arrayBufferToBase64(iv),
    key: arrayBufferToBase64(wrappedKey)
  });
}
```

**Key Unwrapping**:
```typescript
async function unwrapDocumentKey(
  wrappedKeyData: string,
  masterKey: CryptoKey
): Promise<CryptoKey> {
  const { iv, key } = JSON.parse(wrappedKeyData);
  
  const documentKey = await crypto.subtle.unwrapKey(
    "raw",                // Format to unwrap to
    base64ToArrayBuffer(key),
    masterKey,            // Unwrapping key
    {
      name: "AES-GCM",
      iv: base64ToArrayBuffer(iv),
      tagLength: 128
    },
    {
      name: "AES-GCM",
      length: 256
    },
    true,                 // extractable
    ["encrypt", "decrypt"]
  );
  
  return documentKey;
}
```

## Password-Based Key Derivation (Planned v0.2.0)

### PBKDF2 Implementation

```typescript
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number = 100000
): Promise<CryptoKey> {
  // 1. Import password as key material
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  
  // 2. Derive encryption key using PBKDF2
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,  // 100,000 iterations
      hash: "SHA-256"
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,  // not extractable (more secure)
    ["encrypt", "decrypt"]
  );
  
  return derivedKey;
}
```

**Security Parameters**:
- **Iterations**: 100,000 (OWASP recommended minimum)
- **Salt**: 128-bit random value (unique per user)
- **Hash**: SHA-256
- **Purpose**: Slow down brute-force attacks

**Salt Generation**:
```typescript
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}
```

**Master Key Protection**:
```typescript
async function protectMasterKey(
  masterKey: CryptoKey,
  password: string
): Promise<ProtectedKey> {
  // Generate unique salt
  const salt = generateSalt();
  
  // Derive key from password
  const passwordKey = await deriveKeyFromPassword(password, salt);
  
  // Encrypt master key with password-derived key
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrappedMasterKey = await crypto.subtle.wrapKey(
    "raw",
    masterKey,
    passwordKey,
    {
      name: "AES-GCM",
      iv: iv,
      tagLength: 128
    }
  );
  
  return {
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    wrappedKey: arrayBufferToBase64(wrappedMasterKey)
  };
}
```

## Zero-Knowledge Architecture

### What is Zero-Knowledge?

**Definition**: The server has **zero knowledge** of user data. It cannot:
- Decrypt document content
- Access encryption keys
- Read plaintext data
- Provide decrypted data to third parties

### Implementation

**Client-Side Operations**:
```
User Action          Client                    Server
────────────────────────────────────────────────────────
Create Document  →  Generate Doc Key      →   (None)
                 →  Encrypt Content       →   (None)
                 →  Wrap Doc Key          →   (None)
                 →  Send Encrypted        →   Store Encrypted

Open Document    ←  Request Encrypted     ←   Retrieve Encrypted
                 →  Get Master Key        ←   (None)
                 →  Unwrap Doc Key        ←   (None)
                 →  Decrypt Content       ←   (None)
                 →  Display in Editor     ←   (None)
```

**Server Never Sees**:
- ❌ Master keys
- ❌ Document keys (unwrapped)
- ❌ Plaintext content
- ❌ User passwords

**Server Only Sees**:
- ✅ Encrypted document content
- ✅ Encrypted document keys (wrapped)
- ✅ Encrypted titles
- ✅ Metadata (timestamps, IDs)
- ✅ Password hashes (bcrypt)

### Share Link Security

**Architecture**:
```
Share Flow:
1. User clicks "Share"
2. Client generates share token
3. Client includes encryption key in URL fragment (#)
4. Server stores token metadata (no key)
5. Recipient receives: /share/token#key
6. Browser extracts key from fragment (never sent to server)
7. Client fetches encrypted document
8. Client decrypts with key from URL
```

**URL Structure**:
```
https://4diary.app/share/abc123xyz789#key=base64encodedkey
                        └── token ──┘ └── fragment (client-only) ──┘
```

**Security Properties**:
- Server receives token, not key
- Key stays in browser (fragment not sent in HTTP request)
- Server cannot decrypt shared documents
- Revocation invalidates token, but doesn't expose key

## Authentication & Session Management

### Password Hashing

**Algorithm**: bcrypt  
**Cost Factor**: 10 (2^10 = 1,024 iterations)

```typescript
import bcrypt from 'bcrypt';

// Hash password during signup
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

// Verify password during login
async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

**Security**:
- Salt automatically included
- Slows down brute-force attacks
- Industry-standard for password hashing

### Session Tokens

**Technology**: JWT (JSON Web Tokens) via `jose` library

```typescript
import { SignJWT, jwtVerify } from 'jose';

// Create session token
async function createSessionToken(workspaceId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
  
  const token = await new SignJWT({ workspaceId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
  
  return token;
}

// Verify session token
async function verifySessionToken(token: string): Promise<{ workspaceId: string }> {
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
  
  const { payload } = await jwtVerify(token, secret);
  return payload as { workspaceId: string };
}
```

**Cookie Configuration**:
```typescript
{
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days
  path: '/'
}
```

## Threat Model

### Protected Against

#### ✅ Server Compromise

**Threat**: Attacker gains full access to server/database

**Protection**:
- All content is encrypted
- Attacker only gets encrypted blobs
- Keys not stored on server
- Brute-force infeasible (AES-256)

#### ✅ Database Breach

**Threat**: Database leaked or sold

**Protection**:
- Encrypted content worthless without keys
- Password hashes require brute-force (bcrypt)
- Master keys not in database

#### ✅ Network Sniffing

**Threat**: Man-in-the-middle attack

**Protection**:
- HTTPS/TLS encrypts transport
- Encrypted payloads even if TLS broken
- HSTS forces HTTPS

#### ✅ Malicious Administrator

**Threat**: Server admin tries to read data

**Protection**:
- Cannot decrypt without keys
- Cannot impersonate users for decryption
- Zero-knowledge architecture prevents access

### Partially Protected

#### ⚠️ Browser Extension Malware

**Threat**: Malicious extension accesses memory

**Risk**: Could steal keys from JavaScript memory

**Mitigation**:
- Review installed extensions
- Use browser profiles
- Consider Firefox's extension isolation

#### ⚠️ XSS Attacks

**Threat**: Cross-site scripting injects malicious code

**Risk**: Could steal session tokens or keys

**Mitigation**:
- Content Security Policy (CSP)
- HTML sanitization (for embed previews)
- HTTPOnly cookies (session not accessible to JS)
- Regular security audits

### Not Protected Against

#### ❌ Compromised Client Device

**Threat**: Malware on user's computer

**Risk**: Can access decrypted data in memory

**Mitigation**: Antivirus, OS updates, device encryption

#### ❌ Shoulder Surfing

**Threat**: Someone watches screen

**Risk**: Can see plaintext content

**Mitigation**: Privacy screens, private workspace

#### ❌ Weak Passwords

**Threat**: Easily guessed password

**Risk**: If data exported, could be decrypted offline

**Mitigation**: Strong password requirements, password manager

## Security Best Practices

### For Users

1. **Strong Passwords**
   - Minimum 12+ characters
   - Use password manager
   - Unique to 4Diary

2. **Device Security**
   - Keep OS updated
   - Use antivirus
   - Enable full-disk encryption

3. **Share Carefully**
   - Minimum TTL for shares
   - Revoke after use
   - Share via encrypted channels

4. **Regular Exports**
   - Backup encrypted exports
   - Store securely
   - Test restoration

### For Developers

1. **Code Review**
   - All crypto code reviewed
   - Regular security audits
   - Dependency updates

2. **Testing**
   - Unit tests for crypto functions
   - Integration tests for flows
   - Fuzz testing for inputs

3. **Secrets Management**
   - Never commit secrets
   - Use environment variables
   - Rotate secrets regularly

4. **Monitoring**
   - Log authentication attempts
   - Alert on anomalies
   - Track failed decryptions

### For Self-Hosters

1. **Infrastructure**
   - Keep software updated
   - Use firewall
   - Enable fail2ban

2. **Database**
   - Enable authentication
   - Restrict network access
   - Regular backups

3. **Monitoring**
   - Set up alerts
   - Review logs
   - Track access patterns

4. **Backups**
   - Encrypted backups
   - Offsite storage
   - Test restoration

## Compliance

### GDPR

**4Diary Helps With**:
- ✅ Right to Access (export feature)
- ✅ Right to Erasure (delete account)
- ✅ Right to Portability (JSON/Markdown export)
- ✅ Data Minimization (only necessary metadata)
- ✅ Privacy by Design (encryption built-in)

### HIPAA

**For Healthcare Use**:
- ✅ Encryption at rest and in transit
- ✅ Access controls (authentication)
- ✅ Audit logs (analytics events)
- ⚠️ Requires Business Associate Agreement (self-host)

### SOC 2

**Security Controls**:
- ✅ Encryption (AES-256-GCM)
- ✅ Access control (authentication)
- ✅ Monitoring (error tracking)
- ✅ Backup (export feature)

## Future Enhancements

### Planned Security Improvements

**v0.2.0**:
- PBKDF2 master key protection
- Two-factor authentication (TOTP)
- Security audit logging

**v0.3.0**:
- Hardware security key support (YubiKey)
- Biometric authentication (WebAuthn)
- Advanced threat detection

**v1.0.0**:
- Third-party security audit
- Bug bounty program
- SOC 2 Type II certification

## Security Disclosure

Report security vulnerabilities:
1. **DO NOT** open public GitHub issues
2. Follow [Security Policy](../../SECURITY.md)
3. Use GitHub Security Advisories
4. Expect response within 48 hours

## Next Steps

- Review [Architecture Overview](./architecture.md) for system design
- Check [Database Schema](./database-schema.md) for data structure
- Read [API Reference](./api-reference.md) for endpoints
- See [Encryption Deep Dive](../advanced/encryption.md) for implementation

---

**Last Updated**: November 2025  
**Security Version**: v0.1.0-alpha  
**Audit Status**: Pending (planned for v1.0.0)
