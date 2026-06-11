export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PrivacyReport {
  period: DateRange;
  totalBlocked: number;
  topBlockedDomains: { domain: string; count: number }[];
  weeklyTrend: { weekStart: string; blocked: number }[];
  generatedAt: string;
}

export type ReportStatus = 'idle' | 'generating' | 'ready' | 'error';

export interface PrivacyReportState {
  status: ReportStatus;
  currentReport: PrivacyReport | null;
  dateRange: DateRange | null;
  error: string | null;
}
