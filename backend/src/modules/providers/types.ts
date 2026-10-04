export interface ProviderAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface ProviderStats {
  total: number;
  active: number;
  inactive: number;
  bySpecialty: Record<string, number>;
}
