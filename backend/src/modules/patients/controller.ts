import { Request, Response } from "express";
import { patientService } from "./service";
import { success, paginated } from "../../shared/utils/response";
import { UnauthorizedError } from "../../shared/errors/AppError";
import { PatientQueryInput } from "./validation";

export class PatientController {
  list = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const { patients, meta } = await patientService.getPatients(
      orgId,
      req.query as unknown as PatientQueryInput
    );
    paginated(res, patients, meta, "Patients retrieved successfully");
  };

  getStats = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const stats = await patientService.getPatientStats(orgId);
    success(res, stats, "Patient statistics retrieved successfully", 200);
  };

  getById = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const patientId = String(req.params.id);
    const patient = await patientService.getPatientById(orgId, patientId);
    success(res, patient, "Patient details retrieved successfully", 200);
  };

  create = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const patient = await patientService.createPatient(orgId, userId, req.body);
    success(res, patient, "Patient registered successfully", 201);
  };

  update = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const patientId = String(req.params.id);
    const updated = await patientService.updatePatient(
      orgId,
      userId,
      patientId,
      req.body
    );
    success(res, updated, "Patient updated successfully", 200);
  };

  deactivate = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const patientId = String(req.params.id);
    const deactivated = await patientService.deactivatePatient(
      orgId,
      userId,
      patientId
    );
    success(res, deactivated, "Patient deactivated successfully", 200);
  };
}

export const patientController = new PatientController();
