export type UserRole = 'USER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: UserRole;
    emailVerified: boolean;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}
