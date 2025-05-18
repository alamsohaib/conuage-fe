import { ApiResponse, ChangePassword, ForgotPassword, LoginCredentials, ResetPassword, Token, User, Profile, UserRole, UpdateProfileRequest, ApiError, ChatList, Chat, ChatDetails, CreateChatRequest, CreateMessageRequest, Folder, FolderList, CreateFolderRequest, UpdateFolderRequest, DeleteFolderResponse, Document, DocumentList, CreateDocumentRequest, UpdateDocumentRequest, DeleteDocumentResponse, ProcessDocumentResponse, Organization, UpdateOrganizationRequest, PricingPlanList, Subscription, UpdateSubscriptionRequest, OrganizationLocation, OrganizationLocationList, CreateLocationRequest, UpdateLocationRequest, OrganizationUser, OrganizationUserList, CreateUserRequest, UpdateUserRequest } from "@/lib/types";
import { toast } from "sonner";

const API_URL = "https://conuage-be-187523307981.us-central1.run.app"; // API URL

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("API Error:", response.status, errorData);
      return { error: errorData };
    } catch (e) {
      console.error("Failed to parse error response:", e);
      return { error: { message: `API Error: ${response.status} ${response.statusText}` } };
    }
  }

  try {
    const data = await response.json();
    return { data };
  } catch (e) {
    console.error("Failed to parse success response:", e);
    return { data: {} as T };
  }
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Check if the device is offline
const isOffline = () => {
  return typeof navigator !== 'undefined' && !navigator.onLine;
};

// Helper for fetch with timeout to prevent hanging requests
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 15000): Promise<Response> => {
  // If we're offline, immediately return a specific error
  if (isOffline()) {
    throw new Error('You are offline. Please check your internet connection and try again.');
  }
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if ((error as Error).name === 'AbortError') {
      console.error('Request timed out for URL:', url);
      throw new Error('Request timed out. Please try again.');
    }
    console.error('Fetch error for URL:', url, error);
    
    // Check if the error might be due to CORS
    if ((error as Error).message.includes('Failed to fetch')) {
      console.error('Possible CORS or network issue detected');
      throw new Error('Network error. This might be due to CORS restrictions or the server being unavailable.');
    }
    
    throw error;
  }
};

export const api = {
  // Adding baseUrl and getToken to the api object for easier access
  baseUrl: API_URL,
  getToken: () => localStorage.getItem("authToken"),
  
  // Auth API calls
  auth: {
    signUp: async (userData: {
      email: string;
      password: string;
      first_name?: string;
      last_name?: string;
    }): Promise<ApiResponse<void>> => {
      try {
        console.log("Sending signup request with data:", {
          ...userData,
          password: "[REDACTED]"
        });
        
        // Send exactly what the backend expects without the role parameter
        const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
        return handleResponse<void>(response);
      } catch (error) {
        console.error("Sign up error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    verifyEmail: async (data: {
      email: string;
      code: string;
    }): Promise<ApiResponse<void>> => {
      try {
        console.log("Verifying email with payload:", data);
        const response = await fetch(`${API_URL}/api/v1/auth/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,  // Ensure these match exactly the API spec
            code: data.code     // Keep code as a string parameter
          }),
        });
        return handleResponse<void>(response);
      } catch (error) {
        console.error("Verify email error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    login: async (credentials: LoginCredentials): Promise<ApiResponse<Token>> => {
      try {
        const formData = new URLSearchParams();
        formData.append("username", credentials.username);
        formData.append("password", credentials.password);

        const response = await fetch(`${API_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });
        return handleResponse<Token>(response);
      } catch (error) {
        console.error("Login error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    regenerateVerificationCode: async (email: string): Promise<ApiResponse<void>> => {
      try {
        console.log("Regenerating verification code for email:", email);
        const response = await fetch(`${API_URL}/api/v1/auth/regenerate-verification-code?email=${encodeURIComponent(email)}`, {
          method: "POST",
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Regenerate code API error:", errorData);
          return { error: errorData };
        }
        
        return { data: undefined };
      } catch (error) {
        console.error("Regenerate code error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    forgotPassword: async (data: ForgotPassword): Promise<ApiResponse<void>> => {
      try {
        console.log("Sending forgot password request for email:", data.email);
        const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        
        // Store the email for the reset password page if the request is successful
        if (response.ok) {
          sessionStorage.setItem("reset_password_email", data.email);
        }
        
        return handleResponse<void>(response);
      } catch (error) {
        console.error("Forgot password error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    resetPassword: async (data: { email: string, code: string, password: string }): Promise<ApiResponse<void>> => {
      try {
        // Transform the data to match what the API expects
        const apiPayload = {
          code: data.code,
          new_password: data.password
        };
        
        console.log("Resetting password with payload:", { ...apiPayload, new_password: "[REDACTED]" });
        
        const response = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiPayload),
        });
        return handleResponse<void>(response);
      } catch (error) {
        console.error("Reset password error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    changePassword: async (data: ChangePassword): Promise<ApiResponse<void>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/auth/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        return handleResponse<void>(response);
      } catch (error) {
        console.error("Change password error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    logout: async (): Promise<ApiResponse<void>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        return handleResponse<void>(response);
      } catch (error) {
        console.error("Logout error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    // Get user profile
    getProfile: async (): Promise<ApiResponse<Profile>> => {
      try {
        console.log("Fetching user profile with token:", getAuthHeaders());
        const response = await fetch(`${API_URL}/api/v1/profile`, {
          headers: getAuthHeaders(),
        });
        
        if (response.status === 401) {
          console.error("Unauthorized request to get profile. Token might be invalid.");
          // Clear invalid token
          localStorage.removeItem("authToken");
        }
        
        return handleResponse<Profile>(response);
      } catch (error) {
        console.error("Get profile error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },
    
    // Update user profile
    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<Profile>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        return handleResponse<Profile>(response);
      } catch (error) {
        console.error("Update profile error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },
    
    // Update profile photo
    updateProfilePhoto: async (photo: File): Promise<ApiResponse<string>> => {
      try {
        const formData = new FormData();
        formData.append("photo", photo);
        
        const response = await fetch(`${API_URL}/api/v1/profile/photo`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        });
        return handleResponse<string>(response);
      } catch (error) {
        console.error("Update profile photo error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },
    
    // Get the current user - we'll skip direct use of this endpoint since it's causing issues
    // Instead, we'll derive user data from the profile endpoint
    me: async (): Promise<ApiResponse<User>> => {
      try {
        // First try to get the profile, which is more reliable
        const profileResponse = await api.auth.getProfile();
        
        if (profileResponse.data) {
          // Map the profile data to a User object
          const user: User = {
            id: profileResponse.data.id,
            email: profileResponse.data.email,
            firstName: profileResponse.data.first_name,
            lastName: profileResponse.data.last_name,
            isEmailVerified: profileResponse.data.email_verified,
            status: profileResponse.data.status as "active" | "inactive",
            role: profileResponse.data.role
          };
          
          return { data: user };
        }
        
        // If profile failed, try the direct /users/me endpoint as a fallback
        const response = await fetch(`${API_URL}/api/v1/users/me`, {
          headers: getAuthHeaders(),
        });
        
        return handleResponse<User>(response);
      } catch (error) {
        console.error("Get user error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },
  },

  // Chat API calls
  chat: {
    getChats: async (): Promise<ApiResponse<ChatList>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/chat/chats`, {
          headers: getAuthHeaders(),
        });
        return handleResponse<ChatList>(response);
      } catch (error) {
        console.error("Get chats error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    getChat: async (chatId: string): Promise<ApiResponse<ChatDetails>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/chat/chats/${chatId}`, {
          headers: getAuthHeaders(),
        });
        return handleResponse<ChatDetails>(response);
      } catch (error) {
        console.error("Get chat error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    createChat: async (data: CreateChatRequest): Promise<ApiResponse<Chat>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/chat/chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        return handleResponse<Chat>(response);
      } catch (error) {
        console.error("Create chat error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    deleteChat: async (chatId: string): Promise<ApiResponse<string>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/chat/chats/${chatId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        return handleResponse<string>(response);
      } catch (error) {
        console.error("Delete chat error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    sendMessage: async (chatId: string, data: CreateMessageRequest): Promise<ApiResponse<any>> => {
      try {
        const formData = new FormData();
        formData.append("content", data.content);
        
        if (data.image) {
          formData.append("image", data.image);
        }

        const response = await fetch(`${API_URL}/api/v1/chat/chats/${chatId}/messages/stream`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        });
        return handleResponse<any>(response);
      } catch (error) {
        console.error("Send message error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },
  },

  // Document Management API calls
  documentManagement: {
    // Get all folders with nested structure for a location
    getAllFolders: async (locationId: string): Promise<ApiResponse<Folder[]>> => {
      try {
        if (isOffline()) {
          console.log('Device is offline. Cannot fetch folders.');
          return {
            error: { message: 'You are offline. Please check your internet connection and try again.' }
          };
        }
        
        console.log(`Fetching all nested folders for location: ${locationId}`);
        
        const response = await fetchWithTimeout(`${API_URL}/api/v1/document-management/folders/all?location_id=${locationId}`, {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'cache-control': 'no-cache, no-store, must-revalidate',
            'pragma': 'no-cache',
            'expires': '0'
          }
        }, 15000);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          console.error('Get all folders error:', errorData);
          return {
            error: {
              message: errorData.message || `Server Error: ${response.status} ${response.statusText}`
            }
          };
        }

        const data = await response.json();
        console.log('All folders API response:', data);
        return { data, error: null };
      } catch (error) {
        console.error('Get all folders error:', error);
        
        const errorMessage = (error as Error).message.includes('Failed to fetch')
          ? 'Network error. The server might be unavailable or there may be a CORS issue.'
          : (error as Error).message || 'Network error. Please try again.';
          
        return {
          error: { message: errorMessage }
        };
      }
    },

    // Get folders (root folders or subfolders of a parent)
    getFolders: async (locationId: string, parentFolderId?: string): Promise<ApiResponse<Folder[] | FolderList>> => {
      try {
        if (isOffline()) {
          console.log('Device is offline. Cannot fetch folders.');
          return {
            error: { message: 'You are offline. Please check your internet connection and try again.' }
          };
        }
        
        // Update URL format to match the working endpoint with trailing slash
        let url = `${API_URL}/api/v1/document-management/folders/?location_id=${locationId}`;
        
        // Add parent_folder_id parameter if provided
        if (parentFolderId) {
          url += `&parent_folder_id=${parentFolderId}`;
        }
        
        console.log(`Fetching folders with URL: ${url}`);
        
        const response = await fetchWithTimeout(url, {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'cache-control': 'no-cache, no-store, must-revalidate',
            'pragma': 'no-cache',
            'expires': '0'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          console.error('Get folders error:', errorData);
          return {
            error: {
              message: errorData.message || `Server Error: ${response.status} ${response.statusText}`
            }
          };
        }

        // Return the data directly without wrapping it
        const data = await response.json();
        console.log('Raw API response:', data);
        return { data, error: null };
      } catch (error) {
        console.error('Get folders error:', error);
        
        // Provide more detailed error message based on error type
        const errorMessage = (error as Error).message.includes('Failed to fetch')
          ? 'Network error. The server might be unavailable or there may be a CORS issue.'
          : (error as Error).message || 'Network error. Please try again.';
          
        return {
          error: { message: errorMessage }
        };
      }
    },

    getFolder: async (folderId: string): Promise<ApiResponse<Folder>> => {
      try {
        if (isOffline()) {
          console.log('Device is offline. Cannot fetch folder.');
          return {
            error: { message: 'You are offline. Please check your internet connection and try again.' }
          };
        }
        
        console.log(`Fetching folder with ID: ${folderId}`);
        
        const response = await fetchWithTimeout(`${API_URL}/api/v1/document-management/folders/${folderId}`, {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'cache-control': 'no-cache, no-store, must-revalidate',
            'pragma': 'no-cache',
            'expires': '0'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          console.error('Get folder error:', errorData);
          return {
            error: {
              message: errorData.message || `Server Error: ${response.status} ${response.statusText}`
            }
          };
        }

        const data = await response.json();
        console.log('Folder API response:', data);
        return { data, error: null };
      } catch (error) {
        console.error('Get folder error:', error);
        
        const errorMessage = (error as Error).message.includes('Failed to fetch')
          ? 'Network error. The server might be unavailable or there may be a CORS issue.'
          : (error as Error).message || 'Network error. Please try again.';
          
        return {
          error: { message: errorMessage }
        };
      }
    },

    createFolder: async (data: CreateFolderRequest): Promise<ApiResponse<Folder>> => {
      try {
        console.log("Creating folder with data:", data);
        
        // Ensure we're using the correct endpoint with trailing slash
        const response = await fetchWithTimeout(`${API_URL}/api/v1/document-management/folders/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        }, 15000);
        
        return handleResponse<Folder>(response);
      } catch (error) {
        console.error("Create folder error:", error);
        
        // More detailed error message based on error type
        const errorMessage = (error as Error).message.includes('Failed to fetch')
          ? 'Network error. The server might be unavailable or there may be a CORS issue.'
          : (error as Error).message || 'Network error. Please try again.';
          
        return { 
          error: { message: errorMessage }
        };
      }
    },

    updateFolder: async (folderId: string, data: UpdateFolderRequest): Promise<ApiResponse<Folder>> => {
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/v1/document-management/folders/${folderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        }, 10000);
        return handleResponse<Folder>(response);
      } catch (error) {
        console.error("Update folder error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    deleteFolder: async (folderId: string): Promise<ApiResponse<DeleteFolderResponse>> => {
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/v1/document-management/folders/${folderId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        }, 10000);
        return handleResponse<DeleteFolderResponse>(response);
      } catch (error) {
        console.error("Delete folder error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    getDocuments: async (folderId: string): Promise<ApiResponse<DocumentList>> => {
      try {
        if (isOffline()) {
          console.log('Device is offline. Cannot fetch documents.');
          return {
            error: { message: 'You are offline. Please check your internet connection and try again.' }
          };
        }
        
        console.log("Fetching documents for folder:", folderId);
        // Update URL format to match the working endpoint pattern with trailing slash
        const response = await fetchWithTimeout(`${API_URL}/api/v1/document-management/documents/?folder_id=${encodeURIComponent(folderId)}`, {
          headers: {
            ...getAuthHeaders(),
            'cache-control': 'no-cache, no-store, must-revalidate',
            'pragma': 'no-cache',
            'expires': '0'
          }
        }, 10000);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          console.error('Get documents error:', errorData);
          return {
            error: {
              message: errorData.message || `Server Error: ${response.status} ${response.statusText}`
            }
          };
        }

        const data = await response.json();
        console.log('Documents API response:', data);
        return { data, error: null };
      } catch (error) {
        console.error('Get documents error:', error);
        
        // Provide more detailed error message based on error type
        const errorMessage = (error as Error).message.includes('Failed to fetch')
          ? 'Network error. The server might be unavailable or there may be a CORS issue.'
          : (error as Error).message || 'Network error. Please try again.';
          
        return {
          error: { message: errorMessage }
        };
      }
    },

    createDocument: async (data: CreateDocumentRequest): Promise<ApiResponse<Document>> => {
      try {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("folder_id", data.folder_id);
        formData.append("file", data.file);

        console.log("Uploading document to folder:", data.folder_id);
        const response = await fetchWithTimeout(`${API_URL}/api/v1/document-management/documents`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        }, 30000);
        return handleResponse<Document>(response);
      } catch (error) {
        console.error("Create document error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    updateDocument: async (documentId: string, data: UpdateDocumentRequest): Promise<ApiResponse<Document>> => {
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/v1/document-management/documents/${documentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        }, 10000);
        return handleResponse<Document>(response);
      } catch (error) {
        console.error("Update document error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    deleteDocument: async (documentId: string): Promise<ApiResponse<DeleteDocumentResponse>> => {
      try {
        const response = await fetchWithTimeout(`${API_URL}/api/v1/document-management/documents/${documentId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        }, 10000);
        return handleResponse<DeleteDocumentResponse>(response);
      } catch (error) {
        console.error("Delete document error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    processDocument: async (documentId: string): Promise<ApiResponse<ProcessDocumentResponse>> => {
      try {
        console.log("Processing document via API utility:", documentId);
        
        // Updated endpoint format based on correct URL structure
        const response = await fetchWithTimeout(`${API_URL}/api/v1/document-management/documents/process/${documentId}`, {
          method: "POST",
          headers: getAuthHeaders(),
          cache: 'no-store',
        }, 60000);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          console.error('Process document API error:', errorData, 'Status:', response.status);
          return {
            error: {
              message: errorData.detail || `Server Error: ${response.status} ${response.statusText}`
            }
          };
        }
        
        return handleResponse<ProcessDocumentResponse>(response);
      } catch (error) {
        console.error("Process document error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },
  },
  
  // Organization Management API calls
  organization: {
    getOrganization: async (): Promise<ApiResponse<Organization>> => {
      try {
        console.log("Calling getOrganization API endpoint");
        const response = await fetchWithTimeout(`${API_URL}/api/v1/organizations/my-organization`, {
          headers: getAuthHeaders(),
        }, 10000);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Organization API error:", response.status, errorText);
          
          // Try to parse as JSON first
          try {
            const errorJson = JSON.parse(errorText);
            return { 
              error: { 
                message: errorJson.detail || errorJson.message || `Server Error: ${response.status} ${response.statusText}` 
              } 
            };
          } catch (e) {
            // If not JSON, return as text
            return { 
              error: { 
                message: `Server Error: ${response.status} ${response.statusText}. Details: ${errorText}` 
              } 
            };
          }
        }
        
        return handleResponse<Organization>(response);
      } catch (error) {
        console.error("Get organization error:", error);
        return { error: { message: (error as Error).message || "Network error. Please try again." } };
      }
    },

    updateOrganization: async (data: UpdateOrganizationRequest): Promise<ApiResponse<Organization>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/organizations/my-organization`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        return handleResponse<Organization>(response);
      } catch (error) {
        console.error("Update organization error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    getPricingPlans: async (): Promise<ApiResponse<PricingPlanList>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/organizations/pricing-plans`, {
          headers: getAuthHeaders(),
        });
        return handleResponse<PricingPlanList>(response);
      } catch (error) {
        console.error("Get pricing plans error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    getSubscription: async (): Promise<ApiResponse<Subscription>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/organizations/subscription`, {
          headers: getAuthHeaders(),
        });
        return handleResponse<Subscription>(response);
      } catch (error) {
        console.error("Get subscription error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    updateSubscription: async (data: UpdateSubscriptionRequest): Promise<ApiResponse<Subscription>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/organizations/subscription`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        return handleResponse<Subscription>(response);
      } catch (error) {
        console.error("Update subscription error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    getLocations: async (orgId: string): Promise<ApiResponse<OrganizationLocationList>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/locations/organization/${orgId}`, {
          headers: getAuthHeaders(),
        });
        return handleResponse<OrganizationLocationList>(response);
      } catch (error) {
        console.error("Get locations error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    getLocation: async (locationId: string): Promise<ApiResponse<OrganizationLocation>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/locations/${locationId}`, {
          headers: getAuthHeaders(),
        });
        return handleResponse<OrganizationLocation>(response);
      } catch (error) {
        console.error("Get location error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    createLocation: async (data: CreateLocationRequest): Promise<ApiResponse<OrganizationLocation>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/locations/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        return handleResponse<OrganizationLocation>(response);
      } catch (error) {
        console.error("Create location error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    updateLocation: async (locationId: string, data: UpdateLocationRequest): Promise<ApiResponse<OrganizationLocation>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/locations/${locationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        return handleResponse<OrganizationLocation>(response);
      } catch (error) {
        console.error("Update location error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    deleteLocation: async (locationId: string): Promise<ApiResponse<string>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/locations/${locationId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        return handleResponse<string>(response);
      } catch (error) {
        console.error("Delete location error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    getUsers: async (): Promise<ApiResponse<OrganizationUserList>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/users/`, {
          headers: getAuthHeaders(),
        });
        return handleResponse<OrganizationUserList>(response);
      } catch (error) {
        console.error("Get users error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    getUser: async (userId: string): Promise<ApiResponse<OrganizationUser>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
          headers: getAuthHeaders(),
        });
        return handleResponse<OrganizationUser>(response);
      } catch (error) {
        console.error("Get user error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    createUser: async (data: CreateUserRequest): Promise<ApiResponse<OrganizationUser>> => {
      try {
        const response = await fetch(`${API_URL}/api/v1/users/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(data),
        });
        return handleResponse<OrganizationUser>(response);
      } catch (error) {
        console.error("Create user error:", error);
        return { error: { message: "Network error. Please try again." } };
      }
    },

    updateUser: async (userId: string, userData: UpdateUserRequest): Promise<ApiResponse<OrganizationUser>> => {
      try {
        console.log("Calling update user API with:", {
          userId,
          endpoint: `${API_URL}/api/v1/users/${userId}`,
          userData
        });
        
        // Make sure we have the required fields
        if (!userData.first_name || !userData.last_name || !userData.email) {
          console.error("Missing required fields for user update");
          return {
            error: {
              message: "Missing required fields",
              code: "MISSING_REQUIRED_FIELDS"
            }
          };
        }
        
        // CRITICAL FIX: Ensure a primary location is specified - this is required by the API
        if (!userData.location_id) {
          console.error("Primary location is required for user update");
          return {
            error: {
              message: "Primary location is required",
              code: "MISSING_PRIMARY_LOCATION"
            }
          };
        }
        
        // CRITICAL FIX: Ensure additional_location_ids is an array and doesn't include the primary location
        let additionalLocationIds = Array.isArray(userData.additional_location_ids) 
          ? [...userData.additional_location_ids] 
          : [];
          
        // Make sure primary location is not in additional locations
        additionalLocationIds = additionalLocationIds.filter(id => id !== userData.location_id);
        
        // Create a clean payload that exactly matches what the API expects
        const payload = {
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          role: userData.role,
          status: userData.status || 'active',
          location_id: userData.location_id,
          additional_location_ids: additionalLocationIds
        };
        
        console.log("Final clean payload for API:", payload);
        
        const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(payload),
        });
        
        console.log("Update user API response status:", response.status);
        
        if (!response.ok) {
          console.error("Update user API error:", {
            status: response.status,
            statusText: response.statusText
          });
          
          // Try to get more detailed error info
          try {
            const errorData = await response.json();
            console.error("Detailed error response:", errorData);
            return {
              error: {
                message: errorData.detail || errorData.message || "Failed to update user",
                code: errorData.code || "UPDATE_USER_ERROR",
                details: errorData
              }
            };
          } catch (e) {
            console.error("Could not parse error response");
            return {
              error: {
                message: `Server error: ${response.status} ${response.statusText}`,
                code: "SERVER_ERROR"
              }
            };
          }
        }
        
        // If we get here, the response is OK
        const responseData = await response.json();
        console.log("Update user API success response:", responseData);
        return { data: responseData };
      } catch (error) {
        console.error("Update user error:", error);
        return {
          error: {
            message: error instanceof Error ? error.message : "Unknown error occurred",
            code: "UNKNOWN_ERROR"
          }
        };
      }
    },
  }
};

// Error handling utility
export const handleApiError = (error: ApiError | undefined): void => {
  if (!error) return;
  
  if (error.details) {
    // Handle validation errors
    const firstField = Object.keys(error.details)[0];
    const firstError = error.details[firstField]?.[0];
    if (firstError) {
      toast.error(`${firstField}: ${firstError}`);
      return;
    }
  }
  
  toast.error(error.message || "An unexpected error occurred");
};
