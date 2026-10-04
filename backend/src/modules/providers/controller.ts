import { Request, Response } from "express";
import { providerService } from "./service";
import { success, paginated } from "../../shared/utils/response";
import { UnauthorizedError } from "../../shared/errors/AppError";
import { ProviderQueryInput } from "./validation";

export class ProviderController {
  list = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const { providers, meta } = await providerService.getProviders(
      orgId,
      req.query as unknown as ProviderQueryInput
    );
    paginated(res, providers, meta, "Providers retrieved successfully");
  };

  getStats = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const stats = await providerService.getProviderStats(orgId);
    success(res, stats, "Provider statistics retrieved successfully", 200);
  };

  getById = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const providerId = String(req.params.id);
    const provider = await providerService.getProviderById(orgId, providerId);
    success(res, provider, "Provider details retrieved successfully", 200);
  };

  create = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const provider = await providerService.createProvider(orgId, userId, req.body);
    success(res, provider, "Provider created successfully", 201);
  };

  update = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const providerId = String(req.params.id);
    const provider = await providerService.updateProvider(
      orgId,
      userId,
      providerId,
      req.body
    );
    success(res, provider, "Provider updated successfully", 200);
  };

  deactivate = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const providerId = String(req.params.id);
    const provider = await providerService.deactivateProvider(
      orgId,
      userId,
      providerId
    );
    success(res, provider, "Provider deactivated successfully", 200);
  };
}

export const providerController = new ProviderController();
