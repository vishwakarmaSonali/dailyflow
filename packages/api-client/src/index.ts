/**
 * Main export file for DailyFlow API Client
 */

export { APIClient, type APIClientConfig } from './client';
export { APIEndpoints } from './endpoints';
export { TokenManager, LocalStorageAdapter, AsyncStorageAdapter } from './auth';
export type { TokenStorage } from './auth';
export * from './types';

// Factory function for creating pre-configured client
export function createDailyFlowClient(
  baseURL: string,
  tokenStorage?: any
) {
  const client = new (require('./client')).APIClient({
    baseURL,
    timeout: 30000,
  });

  const endpoints = new (require('./endpoints')).APIEndpoints(client);
  const tokenManager = new (require('./auth')).TokenManager(tokenStorage);

  return {
    client,
    endpoints,
    tokenManager,
  };
}
