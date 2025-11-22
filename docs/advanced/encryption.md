# Encryption Deep Dive

Technical deep dive into 4Diary's cryptographic implementation.

## Encryption Stack

**Algorithm**: AES-256-GCM  
**Key Size**: 256 bits  
**Mode**: Galois/Counter Mode (authenticated encryption)  
**Implementation**: Web Crypto API

## Key Hierarchy

```
Master Key (256-bit) - Stored in IndexedDB
    ↓
Document Key 1 (256-bit) - Wrapped with master key
Document Key 2 (256-bit) - Wrapped with master key
Document Key N (256-bit) - Wrapped with master key
```

## Encryption Process

```typescript
// 1. Generate document key
const docKey = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"]
);

// 2. Encrypt content
const iv = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv, tagLength: 128 },
  docKey,
  contentBytes
);

// 3. Wrap document key with master key
const wrappedKey = await crypto.subtle.wrapKey(
  "raw",
  docKey,
  masterKey,
  { name: "AES-GCM", iv, tagLength: 128 }
);
```

## Security Properties

- **Confidentiality**: AES-256 encryption
- **Integrity**: GCM authentication tag (128-bit)
- **Uniqueness**: Random IV per encryption (never reused)
- **Zero-Knowledge**: Server cannot decrypt

## Password-Based Key Derivation (Planned v0.2.0)

```typescript
// PBKDF2 with 100,000 iterations
const key = await crypto.subtle.deriveKey(
  {
    name: "PBKDF2",
    salt: randomSalt,
    iterations: 100000,
    hash: "SHA-256"
  },
  passwordKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt", "decrypt"]
);
```

## Share Link Security

**Architecture**:
```
URL: https://app/share/token#key
     ├─ Token (server-side)
     └─ Key in fragment (client-only, never sent to server)
```

- Server stores token metadata (no key)
- Encryption key in URL fragment (#)
- Browser extracts key without server access
- Server cannot decrypt shared documents

## Threat Model

### Protected Against
- ✅ Server compromise
- ✅ Database breach  
- ✅ Network sniffing
- ✅ Malicious admin

### Partially Protected
- ⚠️ Browser extension malware
- ⚠️ XSS attacks

### Not Protected Against
- ❌ Compromised client device
- ❌ Weak passwords
- ❌ Shoulder surfing

## Implementation Details

### Random Number Generation

```typescript
// Cryptographically secure random
const iv = crypto.getRandomValues(new Uint8Array(12));
const salt = crypto.getRandomValues(new Uint8Array(16));
```

### Constant-Time Operations

Web Crypto API provides constant-time operations to prevent timing attacks.

### Key Storage

- **Master Key**: IndexedDB (browser storage)
- **Document Keys**: Wrapped and stored with documents
- **Share Keys**: Included in URL fragment

## Next Steps

- Review [Security Architecture](../architecture/security-architecture.md)
- See [Security & Privacy Guide](../guides/security-privacy.md)
- Check [API Reference](../architecture/api-reference.md)

---

**Last Updated**: November 2025  
**Algorithm**: AES-256-GCM (NIST-approved)
