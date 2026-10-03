import { Request, Response } from "express";
import { userService } from "./service";
import { success, paginated } from "../../shared/utils/response";
import { UnauthorizedError } from "../../shared/errors/AppError";
import { UserQueryInput } from "./validation";

export class UserController {
  list = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const { users, meta } = await userService.getUsers(
      orgId,
      req.query as unknown as UserQueryInput
    );
    paginated(res, users, meta, "Users retrieved successfully");
  };

  getById = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const targetUserId = String(req.params.id);
    const user = await userService.getUserById(orgId, targetUserId);
    success(res, user, "User details retrieved successfully", 200);
  };

  create = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const currentUserId = req.user?.userId;
    if (!orgId || !currentUserId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const result = await userService.createUser(orgId, currentUserId, req.body);
    success(res, result, "User created successfully", 201);
  };

  update = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const currentUserId = req.user?.userId;
    if (!orgId || !currentUserId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const targetUserId = String(req.params.id);
    const updated = await userService.updateUser(
      orgId,
      targetUserId,
      req.body,
      currentUserId
    );
    success(res, updated, "User updated successfully", 200);
  };

  deactivate = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const currentUserId = req.user?.userId;
    if (!orgId || !currentUserId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const targetUserId = String(req.params.id);
    const deactivated = await userService.deleteUser(
      orgId,
      targetUserId,
      currentUserId
    );
    success(res, deactivated, "User deactivated successfully", 200);
  };
}

export const userController = new UserController();
