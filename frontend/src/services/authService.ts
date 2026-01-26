/**
 * Authentication Service
 * 
 * Handles authentication-related API calls: login, register, logout.
 */

import { api, ApiException } from './api';
import type { User } from '@/types';

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export interface RegisterRequest {
    email: string;
    displayName: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// ========================================
// AUTH SERVICE FUNCTIONS
// ========================================

/**
 * Register a new user account.
 * 
 * @param data - Registration data (email, displayName, password)
 * @returns The created user profile
 * @throws ApiException if registration fails (e.g., email already exists)
 */
export const register = async (data: RegisterRequest): Promise<User> => {
    return api.post<User>('/public/register', data, { includeAuth: false });
};

/**
 * Login with email and password.
 * Token is returned in the Authorization header.
 * User profile is returned in the response body.
 * 
 * @param data - Login credentials
 * @returns The user profile
 */
export const login = async (data: LoginRequest): Promise<User> => {
    // For login, we need access to the response headers to extract the token
    // So we use fetch directly here instead of the api wrapper
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new ApiException({ status: response.status, message: errorData.message });
    }

    // Extract token from Authorization header
    const authHeader = response.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        localStorage.setItem('auth_token', token);
    }

    // Parse and store user profile
    const user: User = await response.json();
    localStorage.setItem('current_user', JSON.stringify(user));
    
    return user;
};

/**
 * Logout the current user.
 * Clears the stored authentication token and user data.
 */
export const logout = (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
};

/**
 * Get the current user from localStorage.
 * Returns null if not logged in.
 */
export const getCurrentUser = (): User | null => {
    const userJson = localStorage.getItem('current_user');
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
};

/**
 * Check if user is currently authenticated.
 */
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('auth_token');
};

export const authService = {
    register,
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
};

export default authService;
