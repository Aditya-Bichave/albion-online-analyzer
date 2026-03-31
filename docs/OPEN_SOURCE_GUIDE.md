# Open Source Guide

This document provides guidance for maintaining and contributing to AlbionKit as an open source project.

## 🎯 Project Vision

AlbionKit is a community-driven toolkit for Albion Online players, built with transparency, accessibility, and quality in mind.

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](../LICENSE) for details.

### What This Means

✅ **Users can:**
- Use the code commercially
- Modify the code
- Distribute copies
- Use in private projects

❌ **Users cannot:**
- Hold authors liable
- Remove copyright notice

## 🔐 What NOT to Publish

### Sensitive Files (Already in .gitignore)

**NEVER commit these files:**

```
.env.local              # Environment variables with secrets
.env*.local             # Any local env files
firebase-admin*.json    # Firebase service account keys
*.key                   # Private keys
*.pem                   # Certificates
```

### Before First Push

1. **Remove sensitive files:**
   ```bash
   # Check for sensitive files
   git status
   
   # Remove any accidentally committed secrets
   git rm --cached .env.local
   git rm --cached **/*.key
   ```

2. **Verify .gitignore:**
   ```bash
   # Check what will be committed
   git status --ignored
   ```

3. **Check for API keys in code:**
   ```bash
   # Search for potential secrets
   grep -r "AIza" src/
   grep -r "firebaseconfig" src/
   grep -r "secret" src/
   ```

## 🏷️ Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 1.0.0)
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

### Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Publish release on GitHub

## 📝 Code Quality Standards

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Proper type definitions
- Interface over type aliases (for public APIs)

### Code Style

```typescript
// ✅ Good
export function calculateProfit(
  cost: number,
  revenue: number
): number {
  return revenue - cost;
}

// ❌ Avoid
export const calculateProfit = (cost, revenue) => {
  return revenue - cost;
};
```

### Comments

**Do comment:**
- Why (not what)
- Complex business logic
- Workarounds
- Performance considerations

```typescript
// ✅ Good comment
// Using debounce here to prevent excessive API calls
// while user is typing
const debouncedSearch = debounce(search, 300);

// ❌ Unnecessary comment
// Set loading to true
setLoading(true);
```

**Remove before publishing:**
- TODO comments (or move to issues)
- FIXME comments
- Personal notes
- AI-generated comments

### Remove AI/Vibe-Coded Traces

Before publishing, search for and remove:

```bash
# Search patterns
grep -r "AI generated" src/
grep -r "vibe coded" src/
grep -r "TODO: fix this" src/
grep -r "hacky fix" src/
grep -r "temporary solution" src/
```

Replace with professional comments:

```typescript
// ❌ Before
// TODO: fix this hacky mess later
// AI generated code

// ✅ After
// This implementation uses a workaround for the
// Firebase batch write limit (500 operations).
// Consider refactoring when scaling is needed.
```

## 🌍 Translation Contributions

### How Translators Can Contribute

1. **Find missing translations** in `messages/` directory
2. **Compare with English** (`messages/en.json`)
3. **Add translations** maintaining JSON structure
4. **Test** by running the app
5. **Submit PR** with only translation changes

### Translation Guidelines

See [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md) for detailed instructions.

### Quality Control

- Native speakers review translations
- Context testing in the UI
- Consistency with game terminology
- No machine translation without review

## 🐛 Issue Management

### Issue Labels

- `bug` - Something isn't working
- `feature` - New feature request
- `translations` - Translation tasks
- `good first issue` - Beginner-friendly
- `help wanted` - Needs community help
- `documentation` - Docs improvements
- `enhancement` - Existing feature improvement
- `question` - Need more information

### Issue Templates

Use GitHub issue templates for:
- Bug reports
- Feature requests
- Translation contributions

## 🔀 Pull Request Guidelines

### Before Submitting

- [ ] Code builds: `npm run build`
- [ ] No TypeScript errors
- [ ] Tested locally
- [ ] Documentation updated
- [ ] Translations added (if applicable)

### PR Labels

- `needs review` - Awaiting code review
- `needs tests` - Requires test coverage
- `ready to merge` - Approved and ready
- `blocked` - Cannot merge yet

### Review Process

1. **Automated checks** run
2. **Maintainer review** assigned
3. **Feedback** provided
4. **Changes** requested (if needed)
5. **Approval** and merge

## 📦 Dependency Management

### Regular Updates

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Update major versions (careful!)
npm install package@latest
```

### Security

```bash
# Check for vulnerabilities
npm audit

# Auto-fix
npm audit fix

# Force fix (breaking changes possible)
npm audit fix --force
```

### Adding New Dependencies

Consider:
- Is it necessary?
- Bundle size impact
- Security track record
- Maintenance status
- License compatibility

## 🚀 Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Configure environment variables
3. Automatic deployments on push
4. Preview deployments for PRs

### Self-Hosting

```bash
# Build
npm run build

# Start
npm run start
```

Requires:
- Node.js 20+
- Environment variables
- Reverse proxy (nginx)
- SSL certificate

## 📊 Project Health

### Metrics to Track

- **Issues:** Open vs. closed ratio
- **PRs:** Time to merge
- **Contributors:** Active contributors
- **Translations:** Completion percentage
- **Builds:** Success rate

### Monthly Maintenance

- [ ] Review open issues
- [ ] Update dependencies
- [ ] Check security advisories
- [ ] Review translation progress
- [ ] Update documentation

## 🤝 Community Building

### Welcoming Contributors

- Respond to issues promptly
- Be helpful in PR reviews
- Recognize contributions
- Create beginner-friendly issues
- Maintain positive atmosphere

### Recognition

- Credit in README
- Release notes mentions
- Discord roles
- Contributor spotlight

## 📈 Growing the Project

### Promotion

- Share updates on social media
- Post in Albion Online communities
- Write blog posts
- Create tutorial videos
- Attend game events

### Partnerships

- Collaborate with content creators
- Partner with guilds
- Integrate with other tools
- Cross-promote with community projects

## 🔒 Security Best Practices

### For Maintainers

- Review all PRs carefully
- Don't commit secrets
- Use 2FA on GitHub
- Limit repository access
- Monitor for vulnerabilities

### For Contributors

- Report security issues privately
- Don't share API keys
- Follow security guidelines
- Keep dependencies updated

## 📞 Support Channels

- **GitHub Issues** - Bug reports, feature requests
- **Discord** - Community support
- **Twitter** - Announcements
- **Email** - Security issues, private matters
- **Sponsor** - [Support the project](../SPONSORS.md)

## 🎓 Learning Resources

### For New Contributors

- [CONTRIBUTING.md](../CONTRIBUTING.md)
- [DEVELOPMENT.md](DEVELOPMENT.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md)

### For Maintainers

- [GitHub Docs](https://docs.github.com/)
- [Open Source Guide](https://opensource.guide/)
- [Semantic Versioning](https://semver.org/)

---

**Last Updated:** March 2026
