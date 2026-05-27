import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../errors/app-error.js";
import * as authRepository from "../modules/auth/auth.repository.js";
export function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        throw new AppError("Authentication required", 401);
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        throw new AppError("Authentication required", 401);
    }
    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    }
    catch {
        throw new AppError("Invalid or expired token", 401);
    }
}
export function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }
        if (!roles.includes(req.user.role)) {
            throw new AppError("Insufficient permissions", 403);
        }
        next();
    };
}
export async function requireVerifiedEmail(req, _res, next) {
    if (!req.user?.userId) {
        throw new AppError("Authentication required", 401);
    }
    const user = await authRepository.findUserById(req.user.userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    if (!user.emailVerified) {
        throw new AppError("Please verify your email to access this resource", 403);
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map