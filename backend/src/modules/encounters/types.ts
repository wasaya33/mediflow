export interface EncounterStats {
  total: number;
  thisMonth: number;
  byVisitType: Record<string, number>;
}
