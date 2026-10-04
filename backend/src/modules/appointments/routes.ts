import { Router } from "express";
import { appointmentController } from "./controller";
import { auth } from "../../middlewares/auth";
import { tenant } from "../../middlewares/tenant";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../middlewares/asyncHandler";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentQuerySchema,
} from "./validation";

const router = Router();

// Enforce auth & tenant isolation
router.use(auth, tenant);

// GET /api/appointments/upcoming (for dashboard widgets)
router.get("/upcoming", asyncHandler(appointmentController.getUpcoming));

// GET /api/appointments/stats (for appointment stats cards)
router.get("/stats", asyncHandler(appointmentController.getStats));

// GET /api/appointments (paginated list with filters)
router.get(
  "/",
  validate({ query: appointmentQuerySchema }),
  asyncHandler(appointmentController.list)
);

// GET /api/appointments/:id
router.get("/:id", asyncHandler(appointmentController.getById));

// POST /api/appointments
router.post(
  "/",
  validate({ body: createAppointmentSchema }),
  asyncHandler(appointmentController.create)
);

// PUT /api/appointments/:id
router.put(
  "/:id",
  validate({ body: updateAppointmentSchema }),
  asyncHandler(appointmentController.update)
);

// PUT /api/appointments/:id/cancel
router.put("/:id/cancel", asyncHandler(appointmentController.cancel));

// PUT /api/appointments/:id/no-show
router.put("/:id/no-show", asyncHandler(appointmentController.markNoShow));

export default router;
