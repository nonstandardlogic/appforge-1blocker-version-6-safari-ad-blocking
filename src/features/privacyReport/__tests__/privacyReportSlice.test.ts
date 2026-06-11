import reducer, {
  setDateRange,
  clearDateRange,
  reportGenerationStarted,
  reportGenerated,
  reportGenerationFailed,
  clearReport,
} from '../privacyReportSlice';
import { PrivacyReport, PrivacyReportState } from '../types';

const initial: PrivacyReportState = {
  status: 'idle',
  currentReport: null,
  dateRange: null,
  error: null,
};

const sampleReport: PrivacyReport = {
  period: { startDate: '2026-06-01', endDate: '2026-06-14' },
  totalBlocked: 500,
  topBlockedDomains: [{ domain: 'doubleclick.net', count: 200 }],
  weeklyTrend: [{ weekStart: '2026-06-08', blocked: 300 }],
  generatedAt: '2026-06-14T12:00:00Z',
};

describe('privacyReportSlice', () => {
  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('setDateRange stores a date range', () => {
    const range = { startDate: '2026-06-01', endDate: '2026-06-14' };
    const state = reducer(initial, setDateRange(range));
    expect(state.dateRange).toEqual(range);
  });

  it('clearDateRange removes the date range', () => {
    const state = reducer(
      { ...initial, dateRange: { startDate: '2026-06-01', endDate: '2026-06-14' } },
      clearDateRange()
    );
    expect(state.dateRange).toBeNull();
  });

  it('reportGenerationStarted sets status to generating and clears error', () => {
    const state = reducer({ ...initial, error: 'previous error' }, reportGenerationStarted());
    expect(state.status).toBe('generating');
    expect(state.error).toBeNull();
  });

  it('reportGenerated sets status to ready and stores report', () => {
    const state = reducer({ ...initial, status: 'generating' }, reportGenerated(sampleReport));
    expect(state.status).toBe('ready');
    expect(state.currentReport).toEqual(sampleReport);
    expect(state.error).toBeNull();
  });

  it('reportGenerationFailed sets status to error with message', () => {
    const state = reducer({ ...initial, status: 'generating' }, reportGenerationFailed('Network timeout'));
    expect(state.status).toBe('error');
    expect(state.error).toBe('Network timeout');
  });

  it('clearReport resets state to idle', () => {
    const populated: PrivacyReportState = {
      status: 'ready',
      currentReport: sampleReport,
      dateRange: { startDate: '2026-06-01', endDate: '2026-06-14' },
      error: null,
    };
    const state = reducer(populated, clearReport());
    expect(state.status).toBe('idle');
    expect(state.currentReport).toBeNull();
    expect(state.error).toBeNull();
  });
});
