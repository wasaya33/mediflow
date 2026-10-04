import { AppointmentStatus } from "@prisma/client";

export interface AppointmentStats {
  today: number;
  thisWeek: number;
  pending: number;
  byStatus: Record<AppointmentStatus, number>;
  total: number;
}
