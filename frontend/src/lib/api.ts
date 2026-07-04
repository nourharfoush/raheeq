/**
 * api.ts — Frontend service layer connecting to the real Express backend.
 * All changes here sync to PostgreSQL and are visible across all LAN devices.
 */

// Dynamically build the API URL using the current page's hostname.
// This ensures that whether accessed from localhost or a LAN IP (e.g. 192.168.1.6),
// the API calls always go to the correct backend server.
function getApiBase(): string {
  if (typeof window === 'undefined') return 'http://localhost:5000/api'; // SSR fallback
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  const host = window.location.hostname; // e.g. 'localhost' or '192.168.1.6'
  return `http://${host}:5000/api`;
}

// ── Token management ──────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tahfez_token');
}

export function setToken(token: string) {
  localStorage.setItem('tahfez_token', token);
}

export function clearToken() {
  localStorage.removeItem('tahfez_token');
}

// ── Core fetch helper ─────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${getApiBase()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'حدث خطأ في الاتصال بالخادم');
  }

  return data as T;
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  username: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'SUPERVISOR';
  isActive: boolean;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

export interface RegisterResponse {
  message: string;
  username: string;
  otp?: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: ApiUser;
}

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  return data;
}

export async function apiRegister(
  username: string,
  password: string,
  name: string,
  phone: string,
  role: string,
  parentId?: string
): Promise<RegisterResponse> {
  return apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, name, phone, role, parentId }),
  });
}

export async function apiVerifyOtp(username: string, otp: string): Promise<VerifyOtpResponse> {
  const data = await apiFetch<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ username, otp }),
  });
  setToken(data.token);
  return data;
}

export async function apiResetPassword(username: string): Promise<{ message: string; otp?: string }> {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function apiConfirmReset(
  username: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiFetch('/auth/confirm-reset', {
    method: 'POST',
    body: JSON.stringify({ username, otp, newPassword }),
  });
}

export async function apiGetMe(): Promise<ApiUser> {
  return apiFetch<ApiUser>('/auth/me');
}

export async function apiUpdateProfile(
  name: string,
  phone: string,
  bio?: string
): Promise<{ user: ApiUser }> {
  return apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, phone, bio }),
  });
}

export async function apiGetUsers(): Promise<ApiUser[]> {
  return apiFetch<ApiUser[]>('/auth/users');
}

export async function apiCreateUser(userData: {
  username: string;
  password?: string;
  name: string;
  phone?: string;
  role: string;
  isActive?: boolean;
}): Promise<ApiUser> {
  return apiFetch<ApiUser>('/auth/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function apiUpdateUser(
  id: string,
  userData: {
    username?: string;
    password?: string;
    name?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
  }
): Promise<ApiUser> {
  return apiFetch<ApiUser>(`/auth/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

export async function apiDeleteUser(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/auth/users/${id}`, {
    method: 'DELETE',
  });
}

// ── Applicants endpoints ──────────────────────────────────────────────────────

export interface ApiApplicant {
  id: string;
  name: string;
  nationalId: string;
  country: string;
  email?: string;
  packageName: string;
  whatsapp: string;
  siblings?: string;
  isMemorized: boolean;
  memorizedSurahs?: string;
  memorizeStart?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export async function apiSubmitApplication(data: {
  name: string;
  nationalId: string;
  country: string;
  email?: string;
  packageName: string;
  whatsapp: string;
  siblings?: string;
  isMemorized: boolean;
  memorizedSurahs?: string;
  memorizeStart?: string;
}): Promise<ApiApplicant> {
  return apiFetch<ApiApplicant>('/applicants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiGetApplicants(): Promise<ApiApplicant[]> {
  return apiFetch<ApiApplicant[]>('/applicants');
}

export async function apiUpdateApplicantStatus(
  id: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
): Promise<ApiApplicant> {
  return apiFetch<ApiApplicant>(`/applicants/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function apiDeleteApplicant(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/applicants/${id}`, {
    method: 'DELETE',
  });
}

