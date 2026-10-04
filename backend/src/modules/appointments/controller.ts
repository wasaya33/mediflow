import { Request, Response } from "express";
import { appointmentService } from "./service";
import { success, paginated } from "../../shared/utils/response";
import { UnauthorizedError } from "../../shared/errors/AppError";
import { AppointmentQueryInput } from "./validation";

export class AppointmentController {
  list = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const { appointments, meta } = await appointmentService.getAppointments(
      orgId,
      req.query as unknown as AppointmentQueryInput
    );
    paginated(res, appointments, meta, "Appointments retrieved successfully");
  };

  getUpcoming = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const appointments = await appointmentService.getUpcomingAppointments(
      orgId,
      limit
    );
    success(res, appointments, "Upcoming appointments retrieved successfully", 200);
  };

  getStats = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const stats = await appointmentService.getAppointmentStats(orgId);
    success(res, stats, "Appointment statistics retrieved successfully", 200);
  };

  getById = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      throw new UnauthorizedError("Organization context required.");
    }

    const appointmentId = String(req.params.id);
    const appointment = await appointmentService.getAppointmentById(
      orgId,
      appointmentId
    );
    success(res, appointment, "Appointment details retrieved successfully", 200);
  };

  create = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const appointment = await appointmentService.createAppointment(
      orgId,
      userId,
      req.body
    );
    success(res, appointment, "Appointment scheduled successfully", 201);
  };

  update = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const appointmentId = String(req.params.id);
    const appointment = await appointmentService.updateAppointment(
      orgId,
      userId,
      appointmentId,
      req.body
    );
    success(res, appointment, "Appointment updated successfully", 200);
  };

  cancel = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const appointmentId = String(req.params.id);
    const appointment = await appointmentService.cancelAppointment(
      orgId,
      userId,
      appointmentId
    );
    success(res, appointment, "Appointment cancelled successfully", 200);
  };

  markNoShow = async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const userId = req.user?.userId;
    if (!orgId || !userId) {
      throw new UnauthorizedError("Authentication and organization context required.");
    }

    const appointmentId = String(req.params.id);
    const appointment = await appointmentService.markNoShow(
      orgId,
      userId,
      appointmentId
    );
    success(res, appointment, "Appointment marked as No-Show successfully", 200);
  };
}

export const appointmentController = new AppointmentController();
