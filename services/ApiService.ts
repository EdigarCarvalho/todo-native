import { BASE_URL } from '../constants/Config';
import { Platform } from 'react-native';

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
  translation?: string; // Add translation field
  attachments: Attachment[];
}

export interface Text {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  cover_url: string;
}

// Define a React Native file object type
export interface RNFile {
  uri: string;
  type: string;
  name: string;
}

export interface AuthData {
  message: string;
  token: string;
}

export interface AuthLoginRequest {
  email: string;
  password;
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
      // console.log("Creating category:", name);
      const response = await fetch(`${this.baseUrl}/category/new`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ name }),
      });

      const result = await this.handleResponse<{ message: string }>(response);
      // console.log("Create category result:", result);
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
      // console.log("Updating category:", id, name);
      const response = await fetch(`${this.baseUrl}/category/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ name }),
      });

      const result = await this.handleResponse<{ message: string }>(response);
      // console.log("Update category result:", result);
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
    translation?: string;
    category_id: number;
    attachments?: RNFile[];
  }): Promise<ApiResponse<Word>> {
    try {
      const formData = new FormData();
      formData.append('name', wordData.name);
      formData.append('meaning', wordData.meaning);
      
      // Add translation if provided
      if (wordData.translation) {
        formData.append('translation', wordData.translation);
      }
      
      formData.append('category_id', wordData.category_id.toString());

      // Handle attachments properly
      if (wordData.attachments && wordData.attachments.length > 0) {
        wordData.attachments.forEach((file, index) => {
          // For each attachment, create a field with a unique name
          const fieldName = `attachment_${index}`;
          
          // For web platform, convert data URI to blob if needed
          if (Platform.OS === 'web' && file.uri.startsWith('data:')) {
            try {
              const mimeMatch = file.uri.match(/^data:([^;]+);base64,/);
              const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
              const base64Data = file.uri.split(',')[1];
              const byteCharacters = atob(base64Data);
              const byteArrays = [];
              
              for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                
                for (let i = 0; i < slice.length; i++) {
                  byteNumbers[i] = slice.charCodeAt(i);
                }
                
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
              }
              
              const blob = new Blob(byteArrays, { type: mime });
              // Add source parameter to identify the attachment
              formData.append(fieldName, blob, file.name);
              // Set empty string as source for now - server will generate URL
              formData.append(`${fieldName}_source`, '');
            } catch (error) {
              console.error("Error converting data URI to blob:", error);
            }
          } else {
            // For native platforms, append file object to form data
            // The field name must match what the Go backend expects
            formData.append(fieldName, {
              uri: file.uri,
              type: file.type,
              name: file.name,
            } as any);
            // Set empty string as source for now - server will generate URL
            formData.append(`${fieldName}_source`, '');
          }
        });
      }

      // console.log("Creating word with formData keys:", Object.keys(formData));

      const response = await fetch(`${this.baseUrl}/word/new`, {
        method: 'POST',
        headers: this.getFormHeaders(true),
        body: formData,
      });

      return this.handleResponse<Word>(response);
    } catch (error) {
      console.error("Create word error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async updateWord(id: number, updates: { 
    name?: string; 
    meaning?: string;
    translation?: string;
    category_id?: number;
  }): Promise<ApiResponse<Word>> {
    try {
      // console.log("Updating word with payload:", updates);
      const response = await fetch(`${this.baseUrl}/word/details/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(updates),
      });

      const result = await this.handleResponse<Word>(response);
      // console.log("Update word response:", result);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async deleteWord(id: number): Promise<ApiResponse<any>> {
    try {
      // console.log("Deleting word with ID:", id);
      const response = await fetch(`${this.baseUrl}/word/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });

      const result = await this.handleResponse(response);
      // console.log("Delete word response:", result);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async addWordAttachment(wordId: number, attachments: RNFile[]): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      
      // Process each attachment and add to form data
      attachments.forEach((file, index) => {
        const fieldName = `attachment_${index}`;
        
        // For web platform, convert data URI to blob if needed
        if (Platform.OS === 'web' && file.uri.startsWith('data:')) {
          try {
            const mimeMatch = file.uri.match(/^data:([^;]+);base64,/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            const base64Data = file.uri.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteArrays = [];
            
            for (let offset = 0; offset < byteCharacters.length; offset += 512) {
              const slice = byteCharacters.slice(offset, offset + 512);
              const byteNumbers = new Array(slice.length);
              
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }
              
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }
            
            const blob = new Blob(byteArrays, { type: mime });
            formData.append(fieldName, blob, file.name);
            // Add source param with empty string
            formData.append(`${fieldName}_source`, '');
          } catch (error) {
            console.error("Error converting data URI to blob:", error);
          }
        } else {
          // For native platforms, append file object
          formData.append(fieldName, {
            uri: file.uri,
            type: file.type,
            name: file.name,
          } as any);
          // Add source param with empty string
          formData.append(`${fieldName}_source`, '');
        }
      });

      // console.log(`Adding attachments to word ${wordId}, formData keys:`, Object.keys(formData));

      const response = await fetch(`${this.baseUrl}/word/attachment/${wordId}`, {
        method: 'POST',
        headers: this.getFormHeaders(true),
        body: formData,
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error("Add attachment error:", error);
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
    cover?: RNFile;
  }): Promise<ApiResponse<Text>> {
    try {
      const formData = new FormData();
      formData.append('title', textData.title);
      formData.append('subtitle', textData.subtitle);
      formData.append('content', textData.content);

      if (textData.cover) {
        // Handle data URI images (base64)
        if (textData.cover.uri.startsWith('data:')) {
          // console.log("Processing data URI image...");
          
          // Extract file type and create appropriate filename
          const mimeMatch = textData.cover.uri.match(/^data:([^;]+);base64,/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const ext = mime.split('/')[1] || 'jpg';
          
          // For web, we need to convert base64 to blob
          if (Platform.OS === 'web') {
            try {
              // Convert base64 to blob for web
              const base64Data = textData.cover.uri.split(',')[1];
              const byteCharacters = atob(base64Data);
              const byteArrays = [];
              
              for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                
                for (let i = 0; i < slice.length; i++) {
                  byteNumbers[i] = slice.charCodeAt(i);
                }
                
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
              }
              
              const blob = new Blob(byteArrays, { type: mime });
              formData.append('cover', blob, `cover.${ext}`);
              // console.log("Added blob to form data from data URI");
            } catch (error) {
              console.error("Error converting data URI to blob:", error);
            }
          } else {
            // For native platforms, just use the URI
            formData.append('cover', {
              uri: textData.cover.uri,
              type: mime,
              name: `cover.${ext}`,
            } as any);
            // console.log("Added data URI to form data for native platform");
          }
        } else {
          // Regular file URI
          formData.append('cover', {
            uri: textData.cover.uri,
            type: textData.cover.type || 'image/jpeg',
            name: textData.cover.name || 'cover.jpg',
          } as any);
          // console.log("Added regular file to form data");
        }
      }

      // console.log("Creating text with formData keys:", Object.keys(formData));

      const response = await fetch(`${this.baseUrl}/text/new`, {
        method: 'POST',
        headers: this.getFormHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          data: errorText
        };
      }

      return this.handleResponse<Text>(response);
    } catch (error) {
      console.error("Create text error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async updateText(id: number, textData: {
    title: string;
    subtitle: string;
    content: string;
    cover?: RNFile;
  }): Promise<ApiResponse<Text>> {
    try {
      const formData = new FormData();
      formData.append('title', textData.title);
      formData.append('subtitle', textData.subtitle);
      formData.append('content', textData.content);

      if (textData.cover) {
        // Handle data URI images (base64)
        if (textData.cover.uri.startsWith('data:')) {
          // console.log("Processing data URI image for update...");
          
          // Extract file type and create appropriate filename
          const mimeMatch = textData.cover.uri.match(/^data:([^;]+);base64,/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const ext = mime.split('/')[1] || 'jpg';
          
          // For web, we need to convert base64 to blob
          if (Platform.OS === 'web') {
            try {
              // Convert base64 to blob for web
              const base64Data = textData.cover.uri.split(',')[1];
              const byteCharacters = atob(base64Data);
              const byteArrays = [];
              
              for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                const slice = byteCharacters.slice(offset, offset + 512);
                const byteNumbers = new Array(slice.length);
                
                for (let i = 0; i < slice.length; i++) {
                  byteNumbers[i] = slice.charCodeAt(i);
                }
                
                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
              }
              
              const blob = new Blob(byteArrays, { type: mime });
              formData.append('cover', blob, `cover.${ext}`);
              // console.log("Added blob to form data from data URI for update");
            } catch (error) {
              console.error("Error converting data URI to blob:", error);
            }
          } else {
            // For native platforms, just use the URI
            formData.append('cover', {
              uri: textData.cover.uri,
              type: mime,
              name: `cover.${ext}`,
            } as any);
            // console.log("Added data URI to form data for native platform");
          }
        } else {
          // Regular file URI
          formData.append('cover', {
            uri: textData.cover.uri,
            type: textData.cover.type || 'image/jpeg',
            name: textData.cover.name || 'cover.jpg',
          } as any);
          // console.log("Added regular file to form data");
        }
      }

      // console.log("Updating text with formData keys:", Object.keys(formData));

      const response = await fetch(`${this.baseUrl}/text/${id}`, {
        method: 'PUT',
        headers: this.getFormHeaders(true),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          data: errorText
        };
      }

      return this.handleResponse<Text>(response);
    } catch (error) {
      console.error("Update text error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async deleteText(id: number): Promise<ApiResponse<any>> {
    try {
      // console.log("Deleting text with ID:", id);
      const response = await fetch(`${this.baseUrl}/text/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });

      const result = await this.handleResponse(response);
      // console.log("Delete text response:", result);
      return result;
    } catch (error) {
      console.error("Delete text error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;
