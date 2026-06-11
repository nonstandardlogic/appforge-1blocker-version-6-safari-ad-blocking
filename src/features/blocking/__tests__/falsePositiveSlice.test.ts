import falsePositiveReducer, {
  falsePositiveActions,
  submitFalsePositiveReport,
} from '../falsePositiveSlice';
import { FalsePositiveReporter } from '../FalsePositiveReporter';

describe('FalsePositiveReporter', () => {
  let reporter: FalsePositiveReporter;

  beforeEach(() => {
    reporter = new FalsePositiveReporter();
  });

  describe('getShareExtensionOptions() — AC1', () => {
    it('exposes "Report broken site" as a share extension option', () => {
      expect(reporter.getShareExtensionOptions()).toContain('Report broken site');
    });
  });

  describe('buildPayload() — AC2', () => {
    it('includes the domain in the payload', () => {
      const payload = reporter.buildPayload('example.com', ['rule-1']);
      expect(payload.domain).toBe('example.com');
    });

    it('includes active rule IDs as a snapshot of blocking state', () => {
      const payload = reporter.buildPayload('example.com', ['rule-1', 'rule-2']);
      expect(payload.activeRuleIds).toEqual(['rule-1', 'rule-2']);
    });

    it('includes app version and OS version metadata', () => {
      const payload = reporter.buildPayload('example.com', []);
      expect(payload.appVersion).toBeTruthy();
      expect(payload.osVersion).toBeTruthy();
    });
  });

  describe('submit() — AC2', () => {
    it('sends the report to the backend with a single POST request', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ reportId: 'abc-123' }),
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const payload = reporter.buildPayload('broken-site.com', ['rule-a']);
      const result = await reporter.submit(payload);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/reports/broken-site'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result.success).toBe(true);
      expect(result.reportId).toBe('abc-123');
    });

    it('includes domain and activeRuleIds in the request body', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ reportId: 'x' }),
      });
      global.fetch = mockFetch as unknown as typeof fetch;

      const payload = reporter.buildPayload('news.example.com', ['r1', 'r2']);
      await reporter.submit(payload);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body as string) as FalsePositiveReporter;
      expect((body as unknown as { domain: string }).domain).toBe('news.example.com');
      expect((body as unknown as { activeRuleIds: string[] }).activeRuleIds).toEqual(['r1', 'r2']);
    });

    it('throws when the server returns a non-OK status', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
      const payload = reporter.buildPayload('example.com', []);
      await expect(reporter.submit(payload)).rejects.toThrow('500');
    });
  });

  describe('isValidDomain()', () => {
    it('accepts valid domain names', () => {
      expect(reporter.isValidDomain('example.com')).toBe(true);
      expect(reporter.isValidDomain('sub.example.co.uk')).toBe(true);
    });

    it('rejects bare words without a TLD', () => {
      expect(reporter.isValidDomain('localhost')).toBe(false);
      expect(reporter.isValidDomain('')).toBe(false);
    });
  });
});

describe('falsePositiveSlice', () => {
  describe('initial state', () => {
    it('starts idle with no reported domain or error', () => {
      const state = falsePositiveReducer(undefined, { type: 'unknown' });
      expect(state.status).toBe('idle');
      expect(state.reportedDomain).toBeNull();
      expect(state.error).toBeNull();
      expect(state.temporaryAllowOffered).toBe(false);
    });
  });

  describe('submitFalsePositiveReport thunk', () => {
    it('sets status to "submitting" while the request is in flight — AC2', () => {
      const action = submitFalsePositiveReport.pending('req-1', {
        domain: 'example.com',
        activeRuleIds: [],
      });
      const state = falsePositiveReducer(undefined, action);
      expect(state.status).toBe('submitting');
      expect(state.error).toBeNull();
    });

    it('records domain and reportId on success — AC2', () => {
      const action = submitFalsePositiveReport.fulfilled(
        { reportId: 'abc-123', domain: 'example.com' },
        'req-1',
        { domain: 'example.com', activeRuleIds: ['rule-1'] },
      );
      const state = falsePositiveReducer(undefined, action);
      expect(state.status).toBe('success');
      expect(state.reportedDomain).toBe('example.com');
      expect(state.reportId).toBe('abc-123');
    });

    it('offers temporary allow after a successful report — AC3', () => {
      const action = submitFalsePositiveReport.fulfilled(
        { reportId: 'abc-123', domain: 'example.com' },
        'req-1',
        { domain: 'example.com', activeRuleIds: [] },
      );
      const state = falsePositiveReducer(undefined, action);
      expect(state.temporaryAllowOffered).toBe(true);
    });

    it('does NOT offer temporary allow on failure — AC3', () => {
      const action = submitFalsePositiveReport.rejected(
        new Error('network error'),
        'req-1',
        { domain: 'example.com', activeRuleIds: [] },
      );
      const state = falsePositiveReducer(undefined, action);
      expect(state.status).toBe('error');
      expect(state.error).toBe('network error');
      expect(state.temporaryAllowOffered).toBe(false);
    });
  });

  describe('resetReport action', () => {
    it('restores initial state after a completed report', () => {
      const fulfilled = submitFalsePositiveReport.fulfilled(
        { reportId: 'x', domain: 'example.com' },
        'req-1',
        { domain: 'example.com', activeRuleIds: [] },
      );
      let state = falsePositiveReducer(undefined, fulfilled);
      state = falsePositiveReducer(state, falsePositiveActions.resetReport());
      expect(state.status).toBe('idle');
      expect(state.reportedDomain).toBeNull();
      expect(state.temporaryAllowOffered).toBe(false);
    });
  });

  describe('dismissTemporaryAllow action — AC3', () => {
    it('clears the temporary allow offer when the user declines', () => {
      const fulfilled = submitFalsePositiveReport.fulfilled(
        { reportId: 'x', domain: 'example.com' },
        'req-1',
        { domain: 'example.com', activeRuleIds: [] },
      );
      let state = falsePositiveReducer(undefined, fulfilled);
      expect(state.temporaryAllowOffered).toBe(true);
      state = falsePositiveReducer(state, falsePositiveActions.dismissTemporaryAllow());
      expect(state.temporaryAllowOffered).toBe(false);
      expect(state.status).toBe('success');
    });
  });
});
