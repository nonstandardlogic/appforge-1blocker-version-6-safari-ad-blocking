import { PrivacyReportGenerator } from '../PrivacyReportGenerator';

describe('PrivacyReportGenerator', () => {
  const generator = new PrivacyReportGenerator();

  const input = {
    totalBlocked: 500,
    topDomains: [
      { domain: 'doubleclick.net', count: 200 },
      { domain: 'googlesyndication.com', count: 150 },
    ],
    weeklyTrend: [
      { weekStart: '2026-06-01', blocked: 120 },
      { weekStart: '2026-06-08', blocked: 380 },
    ],
    dateRange: { startDate: '2026-06-01', endDate: '2026-06-14' },
  };

  it('returns a report with the correct period', () => {
    const report = generator.generate(input);
    expect(report.period).toEqual(input.dateRange);
  });

  it('returns a report with correct totalBlocked', () => {
    const report = generator.generate(input);
    expect(report.totalBlocked).toBe(500);
  });

  it('returns a report with topBlockedDomains from input', () => {
    const report = generator.generate(input);
    expect(report.topBlockedDomains).toEqual(input.topDomains);
  });

  it('returns a report with weeklyTrend from input', () => {
    const report = generator.generate(input);
    expect(report.weeklyTrend).toEqual(input.weeklyTrend);
  });

  it('returns a report with a generatedAt ISO timestamp', () => {
    const before = new Date().toISOString();
    const report = generator.generate(input);
    const after = new Date().toISOString();
    expect(report.generatedAt >= before).toBe(true);
    expect(report.generatedAt <= after).toBe(true);
  });
});
