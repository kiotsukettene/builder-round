interface AccessTokenPayload {
    userId: string;
    role: string;
}
interface RefreshTokenPayload {
    userId: string;
}
export declare function generateAccessToken(payload: AccessTokenPayload): string;
export declare function generateRefreshToken(payload: RefreshTokenPayload): string;
export declare function verifyAccessToken(token: string): AccessTokenPayload;
export declare function verifyRefreshToken(token: string): RefreshTokenPayload;
export {};
//# sourceMappingURL=jwt.d.ts.map