/**
 * API Client Configuration and Core
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { APIError, NetworkError } from './types';

export interface APIClientConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class APIClient {
  private client: AxiosInstance;
  private config: APIClientConfig;
  private requestInterceptor: number | null = null;
  private responseInterceptor: number | null = null;

  constructor(config: APIClientConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.responseInterceptor = this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle network errors
        if (!error.response) {
          throw new NetworkError(
            error.message || 'Network request failed'
          );
        }

        // Handle API errors
        const { status, data } = error.response;
        throw new APIError(
          status,
          data?.message || 'API request failed',
          data
        );
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  private handleError(error: any): never {
    if (error instanceof APIError || error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError('An unexpected error occurred');
  }

  destroy(): void {
    if (this.responseInterceptor !== null) {
      this.client.interceptors.response.eject(this.responseInterceptor);
    }
    if (this.requestInterceptor !== null) {
      this.client.interceptors.request.eject(this.requestInterceptor);
    }
  }
}
