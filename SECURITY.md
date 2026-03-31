# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of AlbionKit seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **support@albionkit.com**

Include as much information as possible:
- Description of the vulnerability
- Steps to reproduce
- Affected versions
- Any potential impact
- Suggested fixes (if any)

### Response Time

You should receive a response within **48 hours** acknowledging your report.

### What to Expect

1. **Initial Response** (48 hours)
   - Acknowledgment of your report
   - Initial assessment of severity

2. **Investigation** (5-7 days)
   - Security team investigates
   - Reproduction attempts
   - Impact analysis

3. **Resolution** (Timeline varies)
   - Fix development
   - Testing
   - Deployment

4. **Disclosure**
   - Coordinated disclosure plan
   - Credit (if desired)
   - Public advisory if critical

## Security Best Practices

### For Users

- Never share your API keys or credentials
- Use strong, unique passwords
- Enable 2FA where available
- Keep your browser updated
- Report suspicious activity

### For Contributors

- Never commit `.env` files or secrets
- Use environment variables for sensitive data
- Sanitize all user inputs
- Validate data on both client and server
- Follow secure coding practices
- Review dependencies for vulnerabilities

## Known Security Measures

### Implemented

- ✅ Environment variable protection
- ✅ HTTPS enforcement (production)
- ✅ Input validation
- ✅ SQL injection prevention (via Firebase)
- ✅ XSS protection (via Next.js)
- ✅ CSRF protection
- ✅ Rate limiting on API routes
- ✅ reCAPTCHA on forms

### In Progress

- 🔄 Content Security Policy (CSP)
- 🔄 Security headers enhancement
- 🔄 Dependency vulnerability scanning
- 🔄 Automated security testing

## Dependency Security

We regularly update dependencies and monitor for vulnerabilities:

```bash
# Check for outdated packages
npm outdated

# Check for known vulnerabilities
npm audit

# Auto-fix vulnerabilities
npm audit fix
```

## Security Updates

Security updates are released as soon as patches are available. Critical updates may be released outside the normal release cycle.

### Notification

Stay informed about security updates:
- Watch the repository for releases
- Follow [@Albion_Kit](https://twitter.com/Albion_Kit)
- Join our Discord community (Coming soon)!

## Bug Bounty Program

Currently, we do not offer a bug bounty program. However, we do provide:

- Public recognition in SECURITY.md (if desired)
- Contributor role on Discord
- Swag for critical vulnerabilities

## Contact

For any security-related questions:
- Email: support@albionkit.com
- Discord: Security channel

## 💖 Support the Project

If you value security in open source, consider supporting us:

- [GitHub Sponsors](https://github.com/sponsors/cosmic-fi)
- [Buy Me a Coffee](https://www.buymeacoffee.com/cosmic_fi)

---

**Last Updated:** March 2026
