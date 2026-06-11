export enum BlockedRequestType {
  AD = 'AD',
  TRACKER = 'TRACKER',
  ANALYTICS = 'ANALYTICS',
}

export interface BlockedRequest {
  id: string;
  appBundleId: string;
  appName: string;
  requestType: BlockedRequestType;
  url: string;
  blockedAt: string;
}

export interface InAppBlockingState {
  enabled: boolean;
  blockingLog: BlockedRequest[];
}

export interface InstalledApp {
  bundleId: string;
  name: string;
}

export interface AppExclusionsState {
  installedApps: InstalledApp[];
  excludedBundleIds: string[];
}

export type StatsPeriod = 'day' | 'week' | 'month';

export interface AppBlockingStats {
  bundleId: string;
  appName: string;
  totalBlocked: number;
  byType: {
    ads: number;
    trackers: number;
    analytics: number;
  };
}

export interface BlockingStatsState {
  statsByApp: AppBlockingStats[];
  selectedPeriod: StatsPeriod;
}
