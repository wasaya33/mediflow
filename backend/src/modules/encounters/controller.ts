import { Request, Response } from "express";
import { encounterService } from "./service";
import { success, paginated } from "../../shared/utils/response";
import { UnauthorizedError } from "../../shared/errors/AppError";
import { EncounterQueryInput } from "./validation";

export class EncounterController {
  list = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const { encounters, meta } = await encounterService.getEncounters(
      orgId,
      req.query as unknown as EncounterQueryInput
    );
    paginated(res, encounters, meta, "Encounters retrieved successfully");
  };

  getStats = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const stats = await encounterService.getEncounterStats(orgId);
    success(res, stats, "Encounter statistics retrieved successfully", 200);
  };

  getById = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const encounterId = String(req.params.id);
    const encounter = await encounterService.getEncounterById(
      orgId,
      encounterId
    );
    success(res, encounter, "Encounter details retrieved successfully", 200);
  };

  getByPatient = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const patientId = String(req.params.patientId);
    const encounters = await encounterService.getEncountersByPatient(
      orgId,
      patientId
    );
    success(res, encounters, "Patient encounters retrieved successfully", 200);
  };

  create = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const encounter = await encounterService.createEncounter(
      orgId,
      userId,
      req.body
    );
    success(res, encounter, "Encounter created successfully", 201);
  };

  update = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const encounterId = String(req.params.id);
    const encounter = await encounterService.updateEncounter(
      orgId,
      userId,
      encounterId,
      req.body
    );
    success(res, encounter, "Encounter updated successfully", 200);
  };
}

export const encounterController = new EncounterController();
