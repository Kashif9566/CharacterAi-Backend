declare enum Role {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
    role?: Role;
}
export {};
