import { DateRange, PrivacyReport } from './types';

interface GenerateInput {
  totalBlocked: number;
  topDomains: { domain: string; count: number }[];
  weeklyTrend: { weekStart: string; blocked: number }[];
  dateRange: DateRange;
}

export class PrivacyReportGenerator {
  generate(data: GenerateInput): PrivacyReport {
    return {
      period: data.dateRange,
      totalBlocked: data.totalBlocked,
      topBlockedDomains: data.topDomains,
      weeklyTrend: data.weeklyTrend,
      generatedAt: new Date().toISOString(),
    };
  }
}
