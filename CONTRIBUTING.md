# Contributing to AlbionKit

Thank you for your interest in contributing to AlbionKit! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Translation Contributions](#translation-contributions)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful and inclusive in all interactions.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/albionkit.git
   cd albionkit
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
5. **Run the development server**
   ```bash
   npm run dev
   ```

## How to Contribute

### 🐛 Reporting Bugs

- Check existing issues first
- Use the bug report template
- Include:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots (if applicable)
  - Environment details (browser, OS)

### 💡 Feature Requests

- Check existing feature requests
- Use the feature request template
- Describe:
  - The problem you want to solve
  - Proposed solution
  - Alternatives considered
  - Use cases

### 🌍 Translations

We support 10+ languages and always welcome translation contributions:

1. Read the [Translation Guide](docs/TRANSLATION_GUIDE.md)
2. Find missing translations in `messages/` directory
3. Submit a PR with your translations
4. Include only translations, no code changes

### 💻 Code Contributions

#### Good First Issues

Look for issues labeled:
- `good first issue` - Perfect for beginners
- `help wanted` - Needs community help
- `translations` - Translation tasks

#### Working on Issues

1. Comment on the issue to claim it
2. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Test thoroughly
5. Submit a PR

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### Component Structure

```tsx
'use client';

import { } from '';

// Types and interfaces
interface Props {
  // ...
}

// Component
export function ComponentName({ }: Props) {
  // Implementation
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new market flipper feature
fix: resolve crash in ZvZ tracker
docs: update translation guide
style: format code according to standards
refactor: improve build cache performance
test: add unit tests for auth service
```

### Testing

Before submitting:

- [ ] Build passes: `npm run build`
- [ ] No TypeScript errors
- [ ] Tested in development mode
- [ ] Checked on mobile viewport

## Pull Request Process

### Before Submitting

1. Update documentation if needed
2. Add tests if applicable
3. Run `npm run build` to ensure no errors
4. Check your code for console logs

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Translation update
- [ ] Documentation update
- [ ] Refactor

## Testing
Describe how you tested this

## Checklist
- [ ] Code builds without errors
- [ ] Tested locally
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. Maintainer reviews code
2. Automated checks run
3. Requested changes are made
4. PR is merged to `main`

## Translation Contributions

### Adding a New Language

1. Create `messages/xx.json` (xx = language code)
2. Copy structure from `messages/en.json`
3. Translate all keys
4. Update i18n configuration in `src/i18n/`
5. Add language to supported list

### Updating Translations

1. Find missing keys in your language file
2. Add translations maintaining JSON structure
3. Test in the application
4. Submit PR with only translation changes

See [docs/TRANSLATION_GUIDE.md](docs/TRANSLATION_GUIDE.md) for detailed instructions.

## Questions?

- Open an issue for questions
- Join our Discord community
- Check existing documentation

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- Discord contributor role

## 💖 Support the Project

If you find AlbionKit useful, consider supporting its development:

- [Buy Me a Coffee](https://www.buymeacoffee.com/cosmic_fi)
- [GitHub Sponsors](https://github.com/sponsors/cosmic-fi)

Your support helps keep the project free and ad-free!

Thank you for contributing to AlbionKit! 🎉
