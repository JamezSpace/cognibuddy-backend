export interface MyJwtPayload {
    id: string;
    role?: "admin" | "parent" | "child";
}