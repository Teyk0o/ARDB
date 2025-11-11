# Contributing to Arc Raiders Database

Thank you for your interest in contributing to Arc Raiders Database! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, professional, and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
- Check existing issues to avoid duplicates
- Test on the latest version
- Clear browser cache and cookies

Submit bug reports using the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml).

### Suggesting Features

Before submitting a feature request:
- Check existing issues and the project roadmap
- Ensure the feature aligns with project goals
- Consider if it benefits multiple users

Submit feature requests using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml).

### Contributing Code

We welcome code contributions! Here's how:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ARDB.git
cd ARDB

# Add upstream remote
git remote add upstream https://github.com/Teyk0o/ARDB.git

# Install dependencies
npm install

# Run development server
npm run dev
```

### Project Structure

```
ARDB/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/              # Utility functions and translations
├── types/            # TypeScript type definitions
├── data/             # Static data files
└── public/           # Static assets
```

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid using `any` type
- Use meaningful variable and function names

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Implement error boundaries where appropriate

### Styling

- Use Tailwind CSS utility classes
- Follow the Arc Raiders design system
- Ensure responsive design (mobile, tablet, desktop)
- Test on multiple browsers

### File Naming

- Components: PascalCase (`ItemCard.tsx`)
- Utilities: camelCase (`translations.ts`)
- Types: camelCase (`item.ts`)
- Constants: UPPERCASE (`CONSTANTS.ts`)

### Code Organization

- One component per file
- Group related utilities
- Keep files under 300 lines when possible
- Extract reusable logic into custom hooks

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes

### Examples

```bash
feat(search): add fuzzy search functionality

fix(modal): resolve click outside not closing modal

docs(readme): update installation instructions

style(items): improve card hover effects

refactor(api): simplify data fetching logic

perf(images): optimize image loading with lazy loading
```

### Commit Best Practices

- Write clear, concise commit messages
- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Reference issues when applicable (`fixes #123`)
- Keep commits atomic (one logical change per commit)

## Pull Request Process

### Before Submitting

1. **Update your fork**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test thoroughly**
   - Run on multiple browsers
   - Test responsive design
   - Test both English and French languages
   - Check console for errors

3. **Code quality**
   - Run linter: `npm run lint`
   - Format code: `npm run format`
   - Fix all warnings and errors

4. **Documentation**
   - Update relevant documentation
   - Add/update code comments
   - Update README if needed

### Submitting

1. Push to your fork
2. Create a pull request to `main` branch
3. Fill out the PR template completely
4. Link related issues
5. Request review

### PR Title

Use the same format as commit messages:
```
feat(search): add advanced filtering options
```

### Review Process

- Maintainers will review your PR
- Address feedback and suggestions
- Keep the discussion focused and professional
- Be patient - reviews take time

### After Approval

- Your PR will be merged by a maintainer
- Delete your feature branch
- Pull the latest changes from upstream

## Testing

### Manual Testing Checklist

- [ ] Functionality works as expected
- [ ] No console errors or warnings
- [ ] Works on Chrome, Firefox, Safari
- [ ] Responsive on mobile, tablet, desktop
- [ ] Both languages (EN/FR) work correctly
- [ ] Accessibility standards maintained
- [ ] No performance regressions

### Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Device Testing

Test on:
- Desktop (1920x1080, 1366x768)
- Tablet (768x1024)
- Mobile (375x667, 414x896)

## Style Guide

### Design System

Follow the Arc Raiders brand guidelines:

- **Primary Color:** `#f1aa1c` (Arc Yellow)
- **Background:** `#130918` (Deep Blue)
- **Text:** `#ece2d0` (Off White)
- **Font:** Barlow (400, 500, 700)

### Component Patterns

```tsx
// Good: Clear prop types, proper structure
interface ItemCardProps {
  item: Item;
  onClick: () => void;
  language: Language;
}

export default function ItemCard({ item, onClick, language }: ItemCardProps) {
  // Component logic
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
}
```

### Accessibility

- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Test with screen readers

## Translation

When adding new text:

1. Add to `lib/translations.ts`
2. Provide both English and French translations
3. Use descriptive keys
4. Test in both languages

```typescript
// lib/translations.ts
export const translations = {
  en: {
    newKey: 'English text',
  },
  fr: {
    newKey: 'Texte français',
  },
};
```

## Questions?

- Open a [Discussion](https://github.com/Teyk0o/ARDB/discussions)
- Join the [Arc Raiders Discord](https://discord.gg/arcraiders)
- Check the [README](README.md)

## License

By contributing, you agree that your contributions will be licensed under the CC BY-NC-ND 4.0 License.

---

Thank you for contributing to Arc Raiders Database!
