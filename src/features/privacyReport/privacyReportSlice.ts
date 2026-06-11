import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DateRange, PrivacyReport, PrivacyReportState } from './types';

const initialState: PrivacyReportState = {
  status: 'idle',
  currentReport: null,
  dateRange: null,
  error: null,
};

const privacyReportSlice = createSlice({
  name: 'privacyReport',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<DateRange>) {
      state.dateRange = action.payload;
    },
    clearDateRange(state) {
      state.dateRange = null;
    },
    reportGenerationStarted(state) {
      state.status = 'generating';
      state.error = null;
    },
    reportGenerated(state, action: PayloadAction<PrivacyReport>) {
      state.status = 'ready';
      state.currentReport = action.payload;
      state.error = null;
    },
    reportGenerationFailed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    clearReport(state) {
      state.status = 'idle';
      state.currentReport = null;
      state.error = null;
    },
  },
});

export const {
  setDateRange,
  clearDateRange,
  reportGenerationStarted,
  reportGenerated,
  reportGenerationFailed,
  clearReport,
} = privacyReportSlice.actions;

export default privacyReportSlice.reducer;
