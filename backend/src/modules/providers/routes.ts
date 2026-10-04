import { Router } from "express";
import { providerController } from "./controller";
import { auth } from "../../middlewares/auth";
import { tenant } from "../../middlewares/tenant";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../middlewares/asyncHandler";
import {
  createProviderSchema,
  updateProviderSchema,
  providerQuerySchema,
} from "./validation";
import { ROLES } from "../../config/constants";

const router = Router();

// Enforce auth & tenant isolation
router.use(auth, tenant);

// GET /api/providers/stats
router.get("/stats", asyncHandler(providerController.getStats));

// GET /api/providers
router.get(
  "/",
  validate({ query: providerQuerySchema }),
  asyncHandler(providerController.list)
);

// GET /api/providers/:id
router.get("/:id", asyncHandler(providerController.getById));

// POST /api/providers
router.post(
  "/",
  authorize(ROLES.ORG_ADMIN, ROLES.BILLING_MANAGER),
  validate({ body: createProviderSchema }),
  asyncHandler(providerController.create)
);

// PUT /api/providers/:id
router.put(
  "/:id",
  authorize(ROLES.ORG_ADMIN, ROLES.BILLING_MANAGER),
  validate({ body: updateProviderSchema }),
  asyncHandler(providerController.update)
);

// PUT /api/providers/:id/deactivate
router.put(
  "/:id/deactivate",
  authorize(ROLES.ORG_ADMIN),
  asyncHandler(providerController.deactivate)
);

export default router;
