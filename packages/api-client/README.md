# DailyFlow Shared API Client

Shared TypeScript API client library for DailyFlow mobile (Expo) and web (React) applications.

## Features

- **Framework-agnostic**: Works with React, React Native, Vue, and other frameworks
- **Full TypeScript support**: Complete type definitions for all API endpoints
- **Auth management**: Built-in token storage and refresh logic
- **Error handling**: Custom error types (APIError, NetworkError)
- **Retry logic**: Automatic request retries on network failures
- **Interceptors**: Request/response interceptor support for middleware

## Installation

```bash
npm install @dailyflow/api-client
# or
yarn add @dailyflow/api-client
```

## Usage

### Basic Setup

```typescript
import { createDailyFlowClient } from '@dailyflow/api-client';

const { endpoints, tokenManager, client } = createDailyFlowClient(
  'http://localhost:3000/api'
);
```

### React Web App

```typescript
import { APIClient, TokenManager } from '@dailyflow/api-client';

const client = new APIClient({ baseURL: 'http://localhost:3000/api' });
const tokenManager = new TokenManager(); // Uses localStorage by default

// Login
const response = await endpoints.login({
  email: 'user@example.com',
  password: 'password'
});

await tokenManager.setTokens(response.access_token, response.refresh_token);
client.setAuthToken(response.access_token);
```

### React Native / Expo

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageAdapter, TokenManager } from '@dailyflow/api-client';

const tokenManager = new TokenManager(
  new AsyncStorageAdapter(AsyncStorage)
);

// Token manager now uses async storage
```

### Using Endpoints

```typescript
// Get all habits
const habits = await endpoints.getHabits();

// Create expense
const expense = await endpoints.createExpense({
  amount: 29.99,
  currency: 'USD',
  category: 'Food'
});

// Log habit
await endpoints.logHabit({
  habit_id: 'morning-run',
  notes: 'Ran 5km'
});

// Get analytics
const analytics = await endpoints.getAnalytics('month');
```

## API Endpoints

### Authentication
- `login(request)` - User login
- `signup(request)` - User registration
- `logout()` - User logout
- `refreshToken(token)` - Refresh access token
- `getCurrentUser()` - Get current user profile

### Habits
- `getHabits(page?, limit?)` - List habits (paginated)
- `getHabit(id)` - Get single habit
- `createHabit(request)` - Create new habit
- `updateHabit(id, request)` - Update habit
- `deleteHabit(id)` - Delete habit
- `logHabit(request)` - Log habit completion
- `getHabitStreaks(id)` - Get current and best streaks
- `getHabitLogs(id, days?)` - Get habit logs

### Expenses
- `getExpenses(page?, limit?)` - List expenses (paginated)
- `getExpense(id)` - Get single expense
- `createExpense(request)` - Create new expense
- `updateExpense(id, request)` - Update expense
- `deleteExpense(id)` - Delete expense
- `getExpensesByCategory(category)` - Filter by category
- `getExpensesByDateRange(start, end)` - Filter by date range

### Insights
- `getInsights()` - Get all insights
- `getInsightByType(type)` - Get specific insight type
- `generateInsights()` - Trigger insight generation

### Analytics
- `getAnalytics(period?)` - Get analytics summary
- `getSpendingTrend(days?)` - Get spending trend data
- `getCategoryBreakdown()` - Get expense breakdown by category
- `getHabitCompletionRate()` - Get habit completion metrics

## Error Handling

```typescript
import { APIError, NetworkError } from '@dailyflow/api-client';

try {
  await endpoints.getExpenses();
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error (${error.status}):`, error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network Error:', error.message);
  }
}
```

## License

MIT
