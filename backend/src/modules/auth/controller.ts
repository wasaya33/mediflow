import { Request, Response } from "express";
import { authService } from "./service";
import { success } from "../../shared/utils/response";
import { UnauthorizedError } from "../../shared/errors/AppError";

export class AuthController {
  register = async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    success(res, result, "Organization and admin user registered successfully", 201);
  };

  login = async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    success(res, result, "Login successful", 200);
  };

  getMe = async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const profile = await authService.getProfile(req.user.userId);
    success(res, profile, "Profile retrieved successfully", 200);
  };

  updateProfile = async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const updated = await authService.updateProfile(req.user.userId, req.body);
    success(res, updated, "Profile updated successfully", 200);
  };

  changePassword = async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const result = await authService.changePassword(req.user.userId, req.body);
    success(res, result, "Password updated successfully", 200);
  };
}

export const authController = new AuthController();
