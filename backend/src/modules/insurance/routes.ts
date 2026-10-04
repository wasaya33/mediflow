import { Router } from "express";
import { insuranceController } from "./controller";
import { auth } from "../../middlewares/auth";
import { tenant } from "../../middlewares/tenant";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../middlewares/asyncHandler";
import {
  createInsuranceSchema,
  updateInsuranceSchema,
} from "./validation";
import { ROLES } from "../../config/constants";

const ALLOWED_MUTATION_ROLES = [
  ROLES.ORG_ADMIN,
  ROLES.BILLING_MANAGER,
  ROLES.BILLING_SPECIALIST,
];

// Router for /api/insurance routes
export const insuranceRoutes = Router();
insuranceRoutes.use(auth, tenant);

// GET /api/insurance/:id
insuranceRoutes.get("/:id", asyncHandler(insuranceController.getById));

// PUT /api/insurance/:id
insuranceRoutes.put(
  "/:id",
  authorize(...ALLOWED_MUTATION_ROLES),
  validate({ body: updateInsuranceSchema }),
  asyncHandler(insuranceController.update)
);

// PUT /api/insurance/:id/deactivate
insuranceRoutes.put(
  "/:id/deactivate",
  authorize(...ALLOWED_MUTATION_ROLES),
  asyncHandler(insuranceController.deactivate)
);

// Nested Router for /api/patients/:patientId/insurances
export const patientInsuranceRoutes = Router({ mergeParams: true });
patientInsuranceRoutes.use(auth, tenant);

// GET /api/patients/:patientId/insurances
patientInsuranceRoutes.get("/", asyncHandler(insuranceController.getByPatient));

// POST /api/patients/:patientId/insurances
patientInsuranceRoutes.post(
  "/",
  authorize(...ALLOWED_MUTATION_ROLES),
  validate({ body: createInsuranceSchema.omit({ patientId: true }) }),
  asyncHandler(insuranceController.create)
);

export default insuranceRoutes;
