import { Request, Response } from "express";
import { insuranceService } from "./service";
import { success } from "../../shared/utils/response";
import { UnauthorizedError } from "../../shared/errors/AppError";

export class InsuranceController {
  getByPatient = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const patientId = String(req.params.patientId);
    const insurances = await insuranceService.getInsurancesByPatient(
      orgId,
      patientId
    );
    success(res, insurances, "Insurance policies retrieved successfully", 200);
  };

  getById = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const insuranceId = String(req.params.id);
    const insurance = await insuranceService.getInsuranceById(
      orgId,
      insuranceId
    );
    success(res, insurance, "Insurance policy details retrieved successfully", 200);
  };

  create = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    // Allow patientId to be supplied via URL param in nested routes
    const patientId = req.params.patientId || req.body.patientId;
    const insurance = await insuranceService.createInsurance(orgId, userId, {
      ...req.body,
      patientId,
    });

    success(res, insurance, "Insurance policy created successfully", 201);
  };

  update = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const insuranceId = String(req.params.id);
    const updated = await insuranceService.updateInsurance(
      orgId,
      userId,
      insuranceId,
      req.body
    );
    success(res, updated, "Insurance policy updated successfully", 200);
  };

  deactivate = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const insuranceId = String(req.params.id);
    const deactivated = await insuranceService.deactivateInsurance(
      orgId,
      userId,
      insuranceId
    );
    success(res, deactivated, "Insurance policy deactivated successfully", 200);
  };
}

export const insuranceController = new InsuranceController();
