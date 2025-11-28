import axios from "axios";
import type { StlFile } from "../types";

// The base URL for your live backend API on EC2
const API_BASE_URL = "http://3.66.168.159:8080/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- API SERVICE DEFINITIONS ---

// AUTH
export const login = async (credentials: any) => {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data; // { user, token }
};

export const register = async (userInfo: any) => {
  const response = await apiClient.post("/auth/register", userInfo);
  return response.data;
};

// Define the expected shape of the paginated response
interface PaginatedFilesResponse {
  files: StlFile[];
  totalPages: number;
  currentPage: number;
  totalFiles: number;
}

// FILES
export const getFiles = async (
  page: number = 1,
  searchTerm?: string
): Promise<PaginatedFilesResponse> => {
  const response = await apiClient.get("/files", {
    params: {
      page,
      search: searchTerm,
      limit: 9, // Match the backend default or your preference
    },
  });
  return response.data;
};

export const uploadFile = async (formData: FormData): Promise<StlFile> => {
  const response = await apiClient.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteFile = async (fileId: string) => {
  const response = await apiClient.delete(`/files/${fileId}`);
  return response.data;
};

export const getFileById = async (id: string): Promise<StlFile> => {
  const response = await apiClient.get(`/files/${id}`);
  return response.data;
};

export const updateFile = async (id: string, updates: { name: string; description: string }): Promise<StlFile> => {
  const response = await apiClient.put(`/files/${id}`, updates);
  return response.data;
};

interface UserType { // This should match the UserType in AuthContext
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export const getAllUsers = async (): Promise<UserType[]> => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const updateUserRole = async (id: string, role: 'user' | 'manager' | 'admin'): Promise<UserType> => {
  const response = await apiClient.put(`/users/${id}/role`, { role });
  return response.data;
};

export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};


