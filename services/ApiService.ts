import { BASE_URL } from '../stores/Dictionary';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T | any;
  error?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Attachment {
  id: number;
  source: string;
  url: string;
}

export interface Word {
  id: number;
  word: string;
  meaning: string;
  attachments: Attachment[];
}

export interface Text {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  cover_url: string;
}

export interface AuthData {
  message: string;
  token: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  name: string;
  email: string;
  password: string;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private getFormHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {};

    if (includeAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          data: errorText
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Response handling error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Auth endpoints - Fixed to match Go backend
  async login(credentials: AuthLoginRequest): Promise<ApiResponse<AuthData>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials),
      });

      return this.handleResponse<AuthData>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async register(userData: AuthRegisterRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Category endpoints - Fixed to match Go backend
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/category/all`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const result = await this.handleResponse<any>(response);
      
      // Handle different response structures
      if (result.success) {
        const categories = result.data?.categories || result.data || [];
        return {
          success: true,
          data: categories
        };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async createCategory(name: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log("Creating category:", name);
      const response = await fetch(`${this.baseUrl}/category/new`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ name }),
      });

      const result = await this.handleResponse<{ message: string }>(response);
      console.log("Create category result:", result);
      return result;
    } catch (error) {
      console.error("Create category error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async updateCategory(id: number, name: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log("Updating category:", id, name);
      const response = await fetch(`${this.baseUrl}/category/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ name }),
      });

      const result = await this.handleResponse<{ message: string }>(response);
      console.log("Update category result:", result);
      return result;
    } catch (error) {
      console.error("Update category error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Word endpoints
  async getWords(): Promise<ApiResponse<{ data: Record<string, Word[]> }>> {
    try {
      const response = await fetch(`${this.baseUrl}/word/all`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return this.handleResponse<{ data: Record<string, Word[]> }>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async createWord(wordData: {
    name: string;
    meaning: string;
    category_id: number;
    attachments?: File[];
  }): Promise<ApiResponse<Word>> {
    try {
      const formData = new FormData();
      formData.append('name', wordData.name);
      formData.append('meaning', wordData.meaning);
      formData.append('category_id', wordData.category_id.toString());

      if (wordData.attachments) {
        wordData.attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }

      const response = await fetch(`${this.baseUrl}/word/new`, {
        method: 'POST',
        headers: this.getFormHeaders(true),
        body: formData,
      });

      return this.handleResponse<Word>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async updateWord(id: number, updates: { name?: string; meaning?: string , category_id?: number}): Promise<ApiResponse<Word>> {
    try {
      const response = await fetch(`${this.baseUrl}/word/details/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(updates),
      });

      return this.handleResponse<Word>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async addWordAttachment(wordId: number, attachments: File[]): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      const response = await fetch(`${this.baseUrl}/word/attachment/${wordId}`, {
        method: 'POST',
        headers: this.getFormHeaders(true),
        body: formData,
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async deleteWordAttachment(attachmentId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/word/attachment/${attachmentId}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async updateWordAttachment(attachmentId: number, source: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/word/attachment/${attachmentId}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ source }),
      });

      return this.handleResponse(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Text endpoints - Fixed endpoint URL
  async getTexts(): Promise<ApiResponse<Text[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/text/all`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return this.handleResponse<Text[]>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async createText(textData: {
    title: string;
    subtitle: string;
    content: string;
    cover?: File;
  }): Promise<ApiResponse<Text>> {
    try {
      const formData = new FormData();
      formData.append('title', textData.title);
      formData.append('subtitle', textData.subtitle);
      formData.append('content', textData.content);

      if (textData.cover) {
        formData.append('cover', textData.cover);
      }

      const response = await fetch(`${this.baseUrl}/text/new`, {
        method: 'POST',
        headers: this.getFormHeaders(true),
        body: formData,
      });

      return this.handleResponse<Text>(response);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;
