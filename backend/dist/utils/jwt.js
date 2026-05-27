import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function generateAccessToken(payload) {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRATION,
    });
}
export function generateRefreshToken(payload) {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRATION,
    });
}
export function verifyAccessToken(token) {
    const payload = jwt.verify(token, env.JWT_SECRET);
    return payload;
}
export function verifyRefreshToken(token) {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    return payload;
}
//# sourceMappingURL=jwt.js.map