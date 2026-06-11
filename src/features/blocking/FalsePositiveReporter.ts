export interface FalsePositiveReport {
  domain: string;
  activeRuleIds: string[];
  appVersion: string;
  osVersion: string;
}

export interface ReportResult {
  success: boolean;
  reportId: string;
}

export class FalsePositiveReporter {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl = 'https://api.1blocker.com/api/v1') {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Returns the options shown in the iOS Share Extension (AC1)
  getShareExtensionOptions(): string[] {
    return ['Report broken site', 'Allow this site'];
  }

  buildPayload(
    domain: string,
    activeRuleIds: string[],
    appVersion = '6.0.0',
    osVersion = '17.0',
  ): FalsePositiveReport {
    return { domain, activeRuleIds, appVersion, osVersion };
  }

  // Submits the report to the backend in a single network call (AC2)
  async submit(report: FalsePositiveReport): Promise<ReportResult> {
    const response = await fetch(`${this.apiBaseUrl}/reports/broken-site`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (!response.ok) {
      throw new Error(`Report submission failed: ${response.status}`);
    }
    const data = (await response.json()) as { reportId?: string };
    return { success: true, reportId: data.reportId ?? '' };
  }

  isValidDomain(domain: string): boolean {
    return /^[a-zA-Z0-9][a-zA-Z0-9\-_.]+\.[a-zA-Z]{2,}$/.test(domain);
  }
}
