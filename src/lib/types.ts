export type UserSignUp = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type VerifyEmail = {
  email: string;
  code: string;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type ForgotPassword = {
  email: string;
};

export type ResetPassword = {
  code: string;
  new_password: string;
};

export type ChangePassword = {
  currentPassword: string;
  newPassword: string;
};

export type Token = {
  access_token: string;
  token_type: string;
};

export type ApiError = {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
};

export type ApiResponse<T> = {
  data?: T;
  error?: ApiError;
};

export type UserRole = 'end_user' | 'org_admin' | 'manager';

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  status: 'active' | 'inactive';
  role?: UserRole;
};

export type Profile = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  status: string;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  chat_tokens_used?: number;
  document_processing_tokens_used?: number;
  daily_chat_tokens_used?: number;
  daily_document_processing_tokens_used?: number;
  daily_token_limit?: number;
  profile_photo_url?: string;
  locations?: Location[];
};

export type Location = {
  location_id: string;
  location_name: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type Chat = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type ChatList = {
  chats: Chat[];
};

export type ChatDetails = {
  chat: {
    id: string;
    name: string;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  messages: Message[];
};

export interface Message {
  id: string;
  chat_id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  sources?: MessageSource[];
  has_image?: boolean;
  isStreaming?: boolean;
}

export type MessageSource = {
  document_id: string;
  page_number: number;
  content: string;
  content_type: string;
  similarity_score: number;
  document_name: string;
  file_path: string;
};

export type CreateChatRequest = {
  name: string;
};

export type CreateMessageRequest = {
  content: string;
  image?: string | null;
};

// Document Management Types
export type Folder = {
  id: string;
  name: string;
  location_id: string;
  parent_folder_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  children?: Folder[]; // Add support for nested children
};

export type FolderList = {
  folders: Folder[];
};

export type CreateFolderRequest = {
  name: string;
  location_id: string;
  parent_folder_id?: string;
};

export type UpdateFolderRequest = {
  name: string;
};

export type DeleteFolderResponse = {
  id: string;
  message: string;
  location_id: string;
  documents_deleted: number;
  subfolders_deleted: number;
};

export type Document = {
  id: string;
  name: string;
  folder_id: string;
  file_path: string;
  file_type: string;
  page_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export type DocumentList = {
  documents: Document[];
};

export type CreateDocumentRequest = {
  name: string;
  folder_id: string;
  file: File;
};

export type UpdateDocumentRequest = {
  name: string;
  folder_id: string;
  file_path?: string;
  file_type?: string;
  page_count?: number;
  status?: string;
};

export type DeleteDocumentResponse = {
  id: string;
  message: string;
  file_path: string;
  folder_id: string;
};

export type ProcessDocumentResponse = {
  message: string;
  document_id: string;
  total_pages_processed: number;
};

// Organization Management Types
export type Organization = {
  id: string;
  name: string;
  address: string;
  country: string;
  state: string;
  city: string;
  post_code: string;
  is_active: boolean;
  auto_signup_enabled: boolean;
  monthly_token_limit: number;
  primary_contact: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  default_location: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  chat_tokens_used: number;
  document_processing_tokens_used: number;
};

export type UpdateOrganizationRequest = {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  post_code?: string;
  default_location_id?: string;
  primary_contact_email?: string;
  auto_signup_enabled?: boolean;
};

export type PricingPlan = {
  id: string;
  name: string;
  cost: number;
  monthly_token_limit_per_user: number;
  daily_token_limit_per_user: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PricingPlanList = PricingPlan[];

export type Subscription = {
  organization_id: string;
  pricing_plan: PricingPlan;
  number_of_users_paid: number;
  subscription_start_date: string;
  subscription_end_date: string;
  monthly_cost: number;
};

export type UpdateSubscriptionRequest = {
  pricing_plan_id: string;
  number_of_users_paid: number;
};

export type OrganizationLocation = {
  id: string;
  name: string;
  details: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
};

export type OrganizationLocationList = OrganizationLocation[];

export type CreateLocationRequest = {
  name: string;
  details: string;
  organization_id: string;
};

export type UpdateLocationRequest = {
  name?: string;
  details?: string;
};

export type OrganizationUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization_id: string;
  locations: {
    location_id: string;
    is_primary: boolean;
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
  }[];
  role: string;
  email_verified: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export type OrganizationUserList = OrganizationUser[];

export type CreateUserRequest = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  location_id: string;
  additional_location_ids?: string[];
  role: UserRole;
  status: 'active' | 'inactive';
};

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  role: "org_admin" | "manager" | "end_user";
  status?: "active" | "inactive";
  location_id: string;
  additional_location_ids: string[];
}

export type UpdateProfileRequest = {
  first_name?: string;
  last_name?: string;
};
