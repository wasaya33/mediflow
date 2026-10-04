import { Router } from "express";
import { patientController } from "./controller";
import { patientInsuranceRoutes } from "../insurance/routes";
import { auth } from "../../middlewares/auth";
import { tenant } from "../../middlewares/tenant";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../middlewares/asyncHandler";
import {
  createPatientSchema,
  updatePatientSchema,
  patientQuerySchema,
} from "./validation";
import { ROLES } from "../../config/constants";

const router = Router();

// Enforce authentication and tenant isolation across all patient routes
router.use(auth, tenant);

// Allowed roles for mutation operations
const ALLOWED_MUTATION_ROLES = [
  ROLES.ORG_ADMIN,
  ROLES.BILLING_MANAGER,
  ROLES.BILLING_SPECIALIST,
];

// GET /api/patients/stats - Organizational patient stats (must be before /:id)
router.get("/stats", asyncHandler(patientController.getStats));

// GET /api/patients - List patients with search, filters, and pagination
router.get(
  "/",
  validate({ query: patientQuerySchema }),
  asyncHandler(patientController.list)
);

// Nested insurances router: /api/patients/:patientId/insurances
router.use("/:patientId/insurances", patientInsuranceRoutes);

// GET /api/patients/:id - Retrieve single patient record by ID
router.get("/:id", asyncHandler(patientController.getById));

// POST /api/patients - Register a new patient
router.post(
  "/",
  authorize(...ALLOWED_MUTATION_ROLES),
  validate({ body: createPatientSchema }),
  asyncHandler(patientController.create)
);

// PUT /api/patients/:id - Update existing patient record
router.put(
  "/:id",
  authorize(...ALLOWED_MUTATION_ROLES),
  validate({ body: updatePatientSchema }),
  asyncHandler(patientController.update)
);

// PUT /api/patients/:id/deactivate - Soft delete patient
router.put(
  "/:id/deactivate",
  authorize(...ALLOWED_MUTATION_ROLES),
  asyncHandler(patientController.deactivate)
);

export default router;
