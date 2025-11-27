import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        data: {
            user: {
                id: string;
                email: string;
                name: string;
                role: import("@prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
            };
            tokens: {
                accessToken: string;
                refreshToken: string;
            };
        };
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        data: {
            user: {
                id: string;
                email: string;
                name: string;
                role: import("@prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
            };
            tokens: {
                accessToken: string;
                refreshToken: string;
            };
        };
        message: string;
    }>;
    logout(user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshTokens(body: {
        refreshToken: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getCurrentUser(user: any): Promise<{
        success: boolean;
        data: any;
    }>;
}
