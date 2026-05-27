# Shared Packages & Configuration

This directory contains shared code and configuration used across all services.

## Directory Structure

```
packages/
├── shared-types/          # TypeScript type definitions
├── shared-utils/          # Utility functions
├── shared-config/         # ESLint, Prettier, Jest configs
└── logger/                # Structured logging utility
```

## Creating Shared Packages

Each package is a self-contained npm module. Services import them like:

```typescript
import { Logger } from '@dailyflow/logger';
import { CreateHabitDto } from '@dailyflow/shared-types';
import { validateEmail } from '@dailyflow/shared-utils';
```

## Setup Workspace in Your IDE

### package.json scripts
Each service should have:
```json
{
  "scripts": {
    "dev": "ts-node src/main.ts",
    "build": "tsc",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  }
}
```

### Using Root Shared Config

In each service, extend the root configs:

**tsconfig.json** (in service):
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

**jest.config.js** (in service):
```javascript
module.exports = {
  ...require('../../jest.config.base.js'),
  displayName: 'habit-service',
};
```

**.eslintrc.js** (in service):
```javascript
module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.json',
  },
};
```

## Adding Dependencies to Packages

Use npm workspaces syntax:

```bash
# Add to shared-types package
npm install lodash --workspace=packages/shared-types

# Add dev dependency to auth-service
npm install @types/jest --workspace=apps/auth-service --save-dev
```

Or edit package.json manually and run:
```bash
npm install
```

## Publishing Packages

When ready for production, publish to npm registry:

```bash
cd packages/shared-types
npm publish
```

## More Information

See [ARCHITECTURE.md](./ARCHITECTURE.md) for how services use shared packages.
