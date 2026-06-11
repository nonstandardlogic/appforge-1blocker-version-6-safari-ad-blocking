export enum FirewallStatus {
  INACTIVE = 'INACTIVE',
  ACTIVATING = 'ACTIVATING',
  ACTIVE = 'ACTIVE',
  DEACTIVATING = 'DEACTIVATING',
}

export interface FirewallState {
  status: FirewallStatus;
  blockedRequestCount: number;
}

export type FirewallRuleType = 'domain' | 'cidr';

export interface FirewallRule {
  id: string;
  type: FirewallRuleType;
  value: string;
  enabled: boolean;
  createdAt: string;
}

export interface FirewallRulesState {
  rules: FirewallRule[];
}

export type ActivityLogFilter = 'all' | 'blocked';

export type ActivityLogAction = 'blocked' | 'allowed';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  domain: string;
  appName: string;
  action: ActivityLogAction;
}

export interface ActivityLogState {
  entries: ActivityLogEntry[];
  filter: ActivityLogFilter;
}

export interface TrustedApp {
  bundleId: string;
  name: string;
}

export interface FirewallAllowlistState {
  installedApps: TrustedApp[];
  trustedBundleIds: string[];
}
