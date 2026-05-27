import type { Request, Response, NextFunction } from "express";
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
export declare function authorize(...roles: string[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare function requireVerifiedEmail(req: Request, _res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map