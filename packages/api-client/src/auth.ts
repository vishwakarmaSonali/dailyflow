/**
 * Authentication Token Manager
 */

export interface TokenStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Browser-based token storage
export class LocalStorageAdapter implements TokenStorage {
  async getItem(key: string): Promise<string | null> {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}

// React Native-compatible storage
export class AsyncStorageAdapter implements TokenStorage {
  constructor(private storage: any) {}

  async getItem(key: string): Promise<string | null> {
    return this.storage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.storage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await this.storage.removeItem(key);
  }
}

export class TokenManager {
  private storage: TokenStorage;
  private accessTokenKey = 'dailyflow_access_token';
  private refreshTokenKey = 'dailyflow_refresh_token';

  constructor(storage?: TokenStorage) {
    this.storage = storage || new LocalStorageAdapter();
  }

  async getAccessToken(): Promise<string | null> {
    return this.storage.getItem(this.accessTokenKey);
  }

  async getRefreshToken(): Promise<string | null> {
    return this.storage.getItem(this.refreshTokenKey);
  }

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.storage.setItem(this.accessTokenKey, accessToken),
      this.storage.setItem(this.refreshTokenKey, refreshToken),
    ]);
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      this.storage.removeItem(this.accessTokenKey),
      this.storage.removeItem(this.refreshTokenKey),
    ]);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}
