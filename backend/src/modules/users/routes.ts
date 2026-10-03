import { Router } from "express";
import { userController } from "./controller";
import { auth } from "../../middlewares/auth";
import { tenant } from "../../middlewares/tenant";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../middlewares/asyncHandler";
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
} from "./validation";

const router = Router();

// Base middleware for all user routes: Authentication + Tenant context
router.use(auth, tenant);

// List users & fetch single user (ORG_ADMIN, BILLING_MANAGER, PLATFORM_ADMIN)
router.get(
  "/",
  authorize("ORG_ADMIN", "BILLING_MANAGER", "PLATFORM_ADMIN"),
  validate({ query: userQuerySchema }),
  asyncHandler(userController.list)
);

router.get(
  "/:id",
  authorize("ORG_ADMIN", "BILLING_MANAGER", "PLATFORM_ADMIN"),
  asyncHandler(userController.getById)
);

// Admin-only user management (ORG_ADMIN, PLATFORM_ADMIN)
router.post(
  "/",
  authorize("ORG_ADMIN", "PLATFORM_ADMIN"),
  validate({ body: createUserSchema }),
  asyncHandler(userController.create)
);

router.put(
  "/:id",
  authorize("ORG_ADMIN", "PLATFORM_ADMIN"),
  validate({ body: updateUserSchema }),
  asyncHandler(userController.update)
);

// Soft delete / deactivation routes
router.put(
  "/:id/deactivate",
  authorize("ORG_ADMIN", "PLATFORM_ADMIN"),
  asyncHandler(userController.deactivate)
);

router.delete(
  "/:id",
  authorize("ORG_ADMIN", "PLATFORM_ADMIN"),
  asyncHandler(userController.deactivate)
);

export default router;
