import { Request, Response } from "express";
import { organizationService } from "./service";
import { success } from "../../shared/utils/response";
import { UnauthorizedError } from "../../shared/errors/AppError";

export class OrganizationController {
  getMe = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context missing.");
    }

    const organization = await organizationService.getOrganization(orgId);
    success(res, organization, "Organization details retrieved successfully", 200);
  };

  updateMe = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;

    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const updated = await organizationService.updateOrganization(orgId, req.body, userId);
    success(res, updated, "Organization updated successfully", 200);
  };
}

export const organizationController = new OrganizationController();
