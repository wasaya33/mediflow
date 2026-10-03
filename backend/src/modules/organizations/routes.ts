import { Router } from "express";
import { organizationController } from "./controller";
import { auth } from "../../middlewares/auth";
import { tenant } from "../../middlewares/tenant";
import { authorize } from "../../middlewares/rbac";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { updateOrgSchema } from "./validation";

const router = Router();

// All organization management routes require authentication, tenant context, and ORG_ADMIN or PLATFORM_ADMIN role
router.use(auth, tenant, authorize("ORG_ADMIN", "PLATFORM_ADMIN"));

router.get("/me", asyncHandler(organizationController.getMe));
router.put("/me", validate({ body: updateOrgSchema }), asyncHandler(organizationController.updateMe));

export default router;
