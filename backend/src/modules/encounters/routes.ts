import { Router } from "express";
import { encounterController } from "./controller";
import { auth } from "../../middlewares/auth";
import { tenant } from "../../middlewares/tenant";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../middlewares/asyncHandler";
import {
  createEncounterSchema,
  updateEncounterSchema,
  encounterQuerySchema,
} from "./validation";

const router = Router();

// Enforce auth & tenant isolation
router.use(auth, tenant);

// GET /api/encounters/stats (stats)
router.get("/stats", asyncHandler(encounterController.getStats));

// GET /api/encounters/patient/:patientId (patient-specific encounters)
router.get("/patient/:patientId", asyncHandler(encounterController.getByPatient));

// GET /api/encounters (paginated list with filters)
router.get(
  "/",
  validate({ query: encounterQuerySchema }),
  asyncHandler(encounterController.list)
);

// GET /api/encounters/:id
router.get("/:id", asyncHandler(encounterController.getById));

// POST /api/encounters
router.post(
  "/",
  validate({ body: createEncounterSchema }),
  asyncHandler(encounterController.create)
);

// PUT /api/encounters/:id
router.put(
  "/:id",
  validate({ body: updateEncounterSchema }),
  asyncHandler(encounterController.update)
);

export default router;
