declare enum Role {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    role?: Role;
}
export {};
