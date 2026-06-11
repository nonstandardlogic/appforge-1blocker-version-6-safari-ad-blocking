export type FilterUpdateStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'applying'
  | 'up_to_date'
  | 'error';

export interface FilterUpdateManifest {
  version: string;
  deltaUrl: string;
  fullUrl: string;
  checksum: string;
  isDelta: boolean;
}

export interface FilterUpdateState {
  status: FilterUpdateStatus;
  currentVersion: string | null;
  pendingManifest: FilterUpdateManifest | null;
  lastCheckedAt: string | null;
  lastAppliedVersion: string | null;
  error: string | null;
  checksumValid: boolean | null;
}
