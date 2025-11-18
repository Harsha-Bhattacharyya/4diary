# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

**Note**: As this is an alpha release (v0.1.0-alpha), we are actively working on improving security features. Post-alpha versions will include enhanced security measures including PBKDF2-based master key encryption.

## Reporting a Vulnerability

The 4diary team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/Harsha-Bhattacharyya/4diary/security) of this repository
   - Click "Report a vulnerability"
   - Fill in the details using the provided template

2. **Direct Email**
   - Send an email to the repository maintainer
   - Include the word "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### What to Include in Your Report

To help us understand and address the issue quickly, please include:

- **Type of vulnerability** (e.g., XSS, CSRF, SQL injection, etc.)
- **Full paths of source file(s)** related to the vulnerability
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it
- **Any potential mitigations** you've identified

### Response Timeline

- **Initial Response**: Within 48 hours of submission
- **Status Update**: Within 7 days with an assessment
- **Fix Timeline**: Varies based on severity and complexity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: 90+ days or next release

### What to Expect

1. **Acknowledgment**: We'll confirm receipt of your vulnerability report
2. **Assessment**: We'll investigate and determine the severity and impact
3. **Updates**: We'll keep you informed of our progress
4. **Resolution**: We'll develop and test a fix
5. **Disclosure**: We'll coordinate disclosure timing with you
6. **Credit**: We'll acknowledge your contribution (unless you prefer to remain anonymous)

## Security Best Practices for Users

### For Self-Hosting

1. **Use Strong Credentials**
   - Set strong passwords for MongoDB and Redis
   - Use environment variables, never hardcode credentials
   - Regularly rotate credentials

2. **Network Security**
   - Run behind a reverse proxy (nginx, Caddy)
   - Use HTTPS/TLS for all connections
   - Implement rate limiting
   - Configure proper CORS policies

3. **Database Security**
   - Keep MongoDB and Redis updated
   - Use authentication for both services
   - Restrict network access to database services
   - Regular backups with encryption

4. **Keep Updated**
   - Regularly update to the latest version
   - Subscribe to security advisories
   - Monitor dependencies for vulnerabilities

### For Development

1. **Never commit secrets** to the repository
2. **Use `.env.local`** for local development (never commit this file)
3. **Run security scans** regularly (`npm audit`)
4. **Review dependencies** before adding them
5. **Follow secure coding practices**

## Known Security Considerations

### Alpha Release Limitations

- **Master Key Storage**: Currently uses base64 encoding. Post-alpha will implement PBKDF2-based password encryption with 100,000+ iterations
- **Session Management**: Uses secure HTTP-only cookies, but additional hardening is planned
- **Rate Limiting**: Implemented for share token creation, but will be expanded to all endpoints

### Privacy by Design

4diary is built with privacy at its core:

- **End-to-End Encryption**: All document content is encrypted client-side using AES-256-GCM
- **Zero Knowledge Architecture**: Server never has access to encryption keys or plaintext content
- **Client-Side Key Management**: Master keys are generated and stored locally in IndexedDB
- **Ephemeral Sharing**: Share tokens have automatic TTL expiration

## Security Features

### Current Implementation

- ✅ AES-256-GCM encryption for all document content
- ✅ Web Crypto API for cryptographic operations
- ✅ Secure session management with HTTP-only cookies
- ✅ HTML sanitization for embed previews (prevents XSS)
- ✅ Rate limiting on share token creation
- ✅ Token-based ephemeral sharing with TTL
- ✅ CSRF protection via Next.js built-in features

### Planned Enhancements (Post-Alpha)

- 🔄 PBKDF2-based master key encryption with user passwords
- 🔄 Enhanced rate limiting across all API endpoints
- 🔄 Additional security headers (CSP, HSTS, etc.)
- 🔄 Two-factor authentication (2FA)
- 🔄 Security audit logging
- 🔄 Automated security scanning in CI/CD
- 🔄 Regular third-party security audits

## Third-Party Dependencies

We regularly monitor our dependencies for security vulnerabilities using:

- **npm audit**: Automated vulnerability scanning
- **Dependabot**: Automated dependency updates
- **GitHub Security Advisories**: Proactive security notifications

To check for vulnerabilities in your installation:

```bash
npm audit
```

To fix vulnerabilities:

```bash
npm audit fix
```

## Bug Bounty Program

We do not currently have a bug bounty program. However, we deeply appreciate security researchers who responsibly disclose vulnerabilities and will acknowledge your contributions in our release notes and security advisories.

## Contact

For security-related questions that are not vulnerabilities, please open a discussion in the [GitHub Discussions](https://github.com/Harsha-Bhattacharyya/4diary/discussions) section.

## Additional Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)

---

**Last Updated**: November 2025  
**Version**: 0.1.0-alpha

Thank you for helping keep 4diary and its users safe!
