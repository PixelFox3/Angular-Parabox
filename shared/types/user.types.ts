export type UserRole = 'user' | 'admin';

export interface UserDto {
    id: string;
    email: string;
    role: UserRole;
    expiresAt: string | null;
    pendingDeletion: boolean;
    createdAt: string;
}

export interface RegisterDto {
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponseDto {
    accessToken: string;
    user: UserDto;
}

export interface UpdateProfileDto {
    name?: string;
    avatarUrl?: string;
}
