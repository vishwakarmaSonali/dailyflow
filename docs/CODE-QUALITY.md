# Code Quality & Development Workflow

## Overview

DailyFlow enforces consistent code quality across all services through automated linting, formatting, and commit validation. All developers must follow these standards.

---

## ESLint Configuration

### What It Does
- Detects bugs and errors in JavaScript/TypeScript code
- Enforces best practices and consistent code style
- Prevents common mistakes

### Rules
```javascript
// ✅ Good
const MAX_ITEMS = 10;
const name = getUserName();

// ❌ Bad
var MAX_ITEMS = 10; // Use const, not var
let name = getUserName(); // Use const if not reassigned
```

### Running ESLint

```bash
# Check all files
npm run lint

# Fix automatically
npm run lint:fix

# Single file
npx eslint src/main.ts --fix
```

---

## Prettier Code Formatting

### What It Does
- Automatic code formatting (no arguments)
- Consistent indentation, quotes, semicolons
- 100 character line width
- Single quotes for strings

### Settings
- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Trailing Commas**: ES5 (objects/arrays only)

### Running Prettier

```bash
# Format all files
npm run format

# Check formatting (no changes)
npm run format:check

# Format single file
npx prettier src/main.ts --write
```

### When Prettier Runs
- Automatically before committing (pre-commit hook)
- In your editor (install Prettier extension)

---

## TypeScript Configuration

### Strict Mode Enabled
- `strict: true` - All strict checks enabled
- `noImplicitAny: true` - Types required
- `noUnusedVariables: true` - No dead code
- `noImplicitReturns: true` - Return types required

### Path Aliases
```typescript
// Instead of: import { Habit } from '../../../domain/entities'
import { Habit } from '@domain/entities'; // ✅ Use aliases

// Available aliases:
@/*                // src/*
@domain/*          // src/domain/*
@application/*     // src/application/*
@infrastructure/*  // src/infrastructure/*
```

### Updating tsconfig.json
```bash
# Edit the root tsconfig.json
nano tsconfig.json
```

---

## Jest Testing Configuration

### Coverage Requirements
- **Overall**: ≥80% lines covered
- **Domain Layer**: ≥90% lines covered
- **Controllers**: ≥70% lines covered

### Test Structure
```
src/
tests/
  ├── unit/              # 70% of tests
  │   ├── domain/
  │   │   └── Habit.test.ts
  │   └── use-cases/
  │       └── CreateHabitUseCase.test.ts
  ├── integration/       # 25% of tests
  │   └── HabitController.test.ts
  └── e2e/              # 5% of tests
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on changes)
npm test -- --watch

# Coverage report
npm run test:coverage

# Single file
npm test -- src/domain/Habit.test.ts
```

### Example Unit Test
```typescript
// src/domain/Habit.test.ts
describe('Habit', () => {
  it('should calculate streak correctly', () => {
    const habit = new Habit('Exercise', 5); // 5 days
    expect(habit.getStreak()).toBe(5);
  });
});
```

---

## Husky Git Hooks

### Pre-commit Hook
Runs automatically before each commit:
1. Runs ESLint (auto-fixes issues)
2. Blocks commit if linting fails
3. Prevents bad code from entering repository

**Bypass** (only in emergencies):
```bash
git commit --no-verify
```

### Commit Message Hook
Validates commit messages against Commitlint rules. Commits must follow the conventional commits format.

---

## Conventional Commits

All commits must follow the format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
```
feat     - New feature
fix      - Bug fix
docs     - Documentation
style    - Code style (formatting, missing semicolons, etc.)
refactor - Code refactoring without changing behavior
perf     - Performance improvement
test     - Adding or updating tests
chore    - Build process, dependencies, tooling
ci       - CI/CD configuration changes
revert   - Reverting a previous commit
```

### Examples

```bash
# Feature
git commit -m "feat(habit-service): add streak milestone detection"

# Bug fix
git commit -m "fix(expense-service): correct budget calculation"

# Multiple services
git commit -m "feat(auth,notification): add email verification"

# Without scope
git commit -m "docs: update README with setup instructions"
```

### With Body (for complex changes)
```
feat(habit-service): add streak milestone detection

- Detect 7-day, 30-day, 100-day milestones
- Publish habit:milestone:reached event
- Trigger notification through event bus

Closes #42
```

---

## Development Workflow

### Step 1: Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Step 2: Make Changes
```bash
# Code...
code src/main.ts

# Check formatting
npm run format:check

# Run tests
npm test

# Fix any issues
npm run lint:fix
npm run format
```

### Step 3: Commit with Conventional Format
```bash
# These will run pre-commit hook automatically
git add .
git commit -m "feat(service-name): description of change"
```

If ESLint fails in pre-commit:
```bash
# Fix issues and try again
npm run lint:fix
git add .
git commit -m "feat(service-name): description"
```

### Step 4: Push & Create PR
```bash
git push origin feature/your-feature-name
# Then create PR on GitHub
```

### Step 5: CI/CD Validation
GitHub Actions automatically runs:
- ESLint validation
- Prettier check
- Jest tests
- Coverage reports

Pull request is blocked if any check fails.

---

## IDE Setup

### VS Code Extensions (Recommended)

1. **ESLint** - Microsoft official extension
   ```json
   {
     "eslint.enable": true,
     "eslint.run": "onSave"
   }
   ```

2. **Prettier** - Official Prettier extension
   ```json
   {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true
   }
   ```

3. **Thunder Client** - For API testing

4. **Prisma** - For database schema editing (when using)

### .vscode/settings.json
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.enable": true,
  "eslint.run": "onSave"
}
```

---

## Troubleshooting

### "ESLint failed in pre-commit"
```bash
# Fix issues automatically
npm run lint:fix

# Add fixed files and commit again
git add .
git commit -m "feat: your message"
```

### "Prettier formatting differs"
```bash
# Format all files
npm run format

# Commit the changes
git add .
git commit -m "style: apply prettier formatting"
```

### "Commit message is invalid"
```bash
# Message must follow: <type>(<scope>): <description>
git commit -m "feat(auth-service): add password reset feature"
```

### Husky hooks not running
```bash
# Reinstall Husky
npx husky install

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

---

## Shared Configuration Files Reference

| File | Purpose |
|------|---------|
| `.eslintrc.js` | ESLint configuration (lint rules) |
| `.prettierrc.js` | Prettier configuration (formatting) |
| `.prettierignore` | Files Prettier should ignore |
| `tsconfig.json` | TypeScript configuration (strict mode) |
| `jest.config.base.js` | Jest base configuration (testing) |
| `commitlint.config.js` | Commitlint configuration (commit validation) |
| `.husky/pre-commit` | Pre-commit hook (runs lint) |
| `.husky/commit-msg` | Commit message hook (validates format) |

---

## References

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Husky Documentation](https://typicode.github.io/husky/)
