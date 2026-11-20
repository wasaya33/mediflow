import { Router } from "express";
import { authController } from "./controller";
import { validate } from "../../middlewares/validate";
import { auth } from "../../middlewares/auth";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { loginRateLimiter, registerRateLimiter } from "../../middlewares/rateLimiter";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "./validation";

const router = Router();

// Public routes (rate limited per client IP)
router.post("/register", registerRateLimiter, validate({ body: registerSchema }), asyncHandler(authController.register));
router.post("/login", loginRateLimiter, validate({ body: loginSchema }), asyncHandler(authController.login));

// Protected routes (any authenticated user)
router.get("/me", auth, asyncHandler(authController.getMe));
router.put("/profile", auth, validate({ body: updateProfileSchema }), asyncHandler(authController.updateProfile));
router.put("/change-password", auth, validate({ body: changePasswordSchema }), asyncHandler(authController.changePassword));

export default router;
