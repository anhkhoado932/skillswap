export interface BaseResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends BaseResponse<T> {
  page: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
} 