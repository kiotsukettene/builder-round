import type { Request, Response, NextFunction } from "express";
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function asyncHandler(fn: AsyncRequestHandler): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=async-handler.d.ts.map