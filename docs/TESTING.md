# Frontend Testing Guide

## Setup

### Install Test Dependencies

```bash
# Dev dependencies
npm install --save-dev jest ts-jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @types/jest identity-obj-proxy
```

### Configuration Files

- `jest.config.js` - Jest configuration
- `src/setupTests.ts` - Test environment setup
- `tsconfig.json` - Updated with Jest types

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test Button.test.tsx
```

## Test Structure

### Unit Tests (Component Tests)

Located in `src/components/**/__tests__/*.test.tsx`

**Example: Button Component**

```typescript
describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onClick handler', async () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Tests

Located in `src/pages/__tests__/*.test.tsx`

```typescript
describe('Habits Page Integration', () => {
  it('loads and displays habits', async () => {
    // Mock API response
    jest.mock('@/hooks/useAPI', () => ({
      useHabits: () => ({
        habits: [...],
        loading: false,
        fetchHabits: jest.fn(),
      }),
    }))

    render(<HabitsPage />)
    expect(screen.getByText('My Habits')).toBeInTheDocument()
  })
})
```

## Test Coverage

Current coverage targets:

```
UI Components:   70% (Button, Modal, Form)
Pages:          50% (Dashboard, Habits, Expenses)
Hooks:          60% (useAPI, useAuth)
Stores:         50% (Zustand stores)
Overall:        55%
```

## Best Practices

### 1. Render Components Properly

```typescript
// ❌ Bad - No context providers
render(<HabitsPage />)

// ✅ Good - With necessary providers
render(
  <BrowserRouter>
    <HabitsPage />
  </BrowserRouter>
)
```

### 2. Use User Events Over Fire Events

```typescript
// ❌ Bad - Fire events
fireEvent.click(button)

// ✅ Good - Simulate user interaction
await userEvent.click(button)
```

### 3. Query Priority

```typescript
// Best: getByRole (semantic, accessible)
screen.getByRole('button', { name: /submit/i })

// Good: getByLabelText (form inputs)
screen.getByLabelText(/email/i)

// Okay: getByText (other elements)
screen.getByText(/modal title/i)

// Last: getByTestId (escape hatch)
screen.getByTestId('special-element')
```

### 4. Async Operations

```typescript
// ✅ Correct - Wait for element
await screen.findByText('Loaded content')

// ✅ Correct - User interaction then wait
await userEvent.click(button)
await screen.findByText('Updated')
```

## Common Testing Patterns

### Testing Form Submission

```typescript
it('submits form with data', async () => {
  const onSubmit = jest.fn()
  render(<MyForm onSubmit={onSubmit} />)
  
  await userEvent.type(screen.getByLabelText(/name/i), 'John')
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
})
```

### Testing API Calls

```typescript
it('fetches data on mount', async () => {
  const mockFetch = jest.fn().mockResolvedValue({
    json: () => ({ data: 'test' }),
  })
  global.fetch = mockFetch
  
  render(<DataComponent />)
  
  await screen.findByText('test')
  expect(mockFetch).toHaveBeenCalledWith('/api/data')
})
```

### Testing Store State

```typescript
it('updates Zustand store', () => {
  const { useStore } = require('@/stores/appStore')
  const { result } = renderHook(() => useStore())
  
  act(() => {
    result.current.setUser({ id: '123', name: 'John' })
  })
  
  expect(result.current.user.name).toBe('John')
})
```

### Testing Routes

```typescript
it('navigates to habits page', async () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
  
  const habitsLink = screen.getByRole('link', { name: /habits/i })
  await userEvent.click(habitsLink)
  
  expect(screen.getByText('My Habits')).toBeInTheDocument()
})
```

## Mocking

### Mock API Client

```typescript
jest.mock('@/hooks/useAPI', () => ({
  useHabits: () => ({
    habits: [{ id: '1', name: 'Exercise' }],
    loading: false,
    error: null,
    fetchHabits: jest.fn(),
    createHabit: jest.fn(),
  }),
}))
```

### Mock Zustand Store

```typescript
jest.mock('@/stores/appStore', () => ({
  useAuthStore: () => ({
    user: { id: '123', name: 'John', email: 'john@example.com' },
    login: jest.fn(),
    logout: jest.fn(),
  }),
}))
```

### Mock Navigation

```typescript
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))
```

## Coverage Report

```bash
npm run test:coverage

# View coverage HTML report
open coverage/lcov-report/index.html
```

Thresholds:
- Statements: 50%
- Branches: 50%
- Functions: 50%
- Lines: 50%

## Debugging Tests

### Run Single Test

```bash
npm run test -- Button.test.tsx
npm run test -- --testNamePattern="renders button"
```

### Debug with Node Inspector

```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### Add console.log

```typescript
it('renders correctly', () => {
  const { debug } = render(<Button>Test</Button>)
  debug() // Prints component tree
})
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run tests
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Test Suite Status:** Initial setup complete (Button, Modal, Form components)
**Coverage:** 55% (to be improved)
**Next Steps:** Add page integration tests, hook tests, E2E tests
