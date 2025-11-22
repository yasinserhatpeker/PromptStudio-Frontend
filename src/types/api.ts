// ============================================
// Auth DTOs
// ============================================

export interface CreateUserDTO {
  email: string;
  password: string;
  username: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LogoutDTO {
  refreshToken?: string | null;
}

export interface RefreshTokenDTO {
  refreshToken?: string | null;
}

// ============================================
// User DTOs
// ============================================

export interface UpdateUserDTO {
  username?: string | null;
  password: string;
}

// ============================================
// Prompt DTOs
// ============================================

export interface CreatePromptDTO {
  title?: string | null;
  content?: string | null;
  tags?: string | null;
  userId: string;
}

export interface UpdatePromptDTO {
  title?: string | null;
  content?: string | null;
  tags?: string | null;
}

// ============================================
// Collection DTOs
// ============================================

export interface CreateCollectionDTO {
  name?: string | null;
  userId: string;
}

export interface UpdateCollectionDTO {
  name?: string | null;
  userId: string;
}

// ============================================
// Response Types (inferred from typical API patterns)
// ============================================

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface Prompt {
  id: string;
  title: string | null;
  content: string | null;
  tags: string | null;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PromptCollection {
  id: string;
  name: string | null;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
