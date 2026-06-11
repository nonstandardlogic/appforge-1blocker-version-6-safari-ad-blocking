import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FalsePositiveReporter } from './FalsePositiveReporter';

type ReportStatus = 'idle' | 'submitting' | 'success' | 'error';

export interface FalsePositiveState {
  status: ReportStatus;
  reportedDomain: string | null;
  reportId: string | null;
  error: string | null;
  temporaryAllowOffered: boolean;
}

interface SubmitArgs {
  domain: string;
  activeRuleIds: string[];
}

const reporter = new FalsePositiveReporter();

export const submitFalsePositiveReport = createAsyncThunk<
  { reportId: string; domain: string },
  SubmitArgs
>('falsePositive/submitReport', async ({ domain, activeRuleIds }) => {
  const payload = reporter.buildPayload(domain, activeRuleIds);
  const result = await reporter.submit(payload);
  return { reportId: result.reportId, domain };
});

const initialState: FalsePositiveState = {
  status: 'idle',
  reportedDomain: null,
  reportId: null,
  error: null,
  temporaryAllowOffered: false,
};

const falsePositiveSlice = createSlice({
  name: 'falsePositive',
  initialState,
  reducers: {
    resetReport(state) {
      state.status = 'idle';
      state.reportedDomain = null;
      state.reportId = null;
      state.error = null;
      state.temporaryAllowOffered = false;
    },
    dismissTemporaryAllow(state) {
      state.temporaryAllowOffered = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(submitFalsePositiveReport.pending, state => {
        state.status = 'submitting';
        state.error = null;
        state.temporaryAllowOffered = false;
      })
      .addCase(submitFalsePositiveReport.fulfilled, (state, action) => {
        state.status = 'success';
        state.reportedDomain = action.payload.domain;
        state.reportId = action.payload.reportId;
        state.temporaryAllowOffered = true; // AC3: offer temporary allow after success
      })
      .addCase(submitFalsePositiveReport.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Report submission failed';
        state.temporaryAllowOffered = false;
      });
  },
});

export const falsePositiveActions = falsePositiveSlice.actions;
export default falsePositiveSlice.reducer;

export const selectFalsePositive = (state: { falsePositive: FalsePositiveState }) =>
  state.falsePositive;
export const selectReportStatus = (state: { falsePositive: FalsePositiveState }) =>
  state.falsePositive.status;
export const selectTemporaryAllowOffered = (state: { falsePositive: FalsePositiveState }) =>
  state.falsePositive.temporaryAllowOffered;
