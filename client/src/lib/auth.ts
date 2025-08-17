import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  username: string;
  role: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

class AuthService {
  private user: User | null = null;
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiRequest('POST', '/api/admin/login', {
      username,
      password
    });
    
    const data: LoginResponse = await response.json();
    
    this.user = data.user;
    this.token = data.token;
    
    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    
    return data;
  }

  logout() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  setAuthHeader(headers: HeadersInit = {}): HeadersInit {
    if (this.token) {
      return {
        ...headers,
        'Authorization': `Bearer ${this.token}`
      };
    }
    return headers;
  }
}

export const authService = new AuthService();
