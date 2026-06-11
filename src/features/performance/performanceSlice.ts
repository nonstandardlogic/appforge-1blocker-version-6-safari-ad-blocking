import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PageLoadMeasurement, PerformanceState } from './types';

const initialState: PerformanceState = {
  measurements: [],
  processingOverheadMs: 0,
  compilationTimeMs: null,
};

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    addMeasurement(state, action: PayloadAction<PageLoadMeasurement>) {
      state.measurements.push(action.payload);
    },
    setProcessingOverhead(state, action: PayloadAction<number>) {
      state.processingOverheadMs = action.payload;
    },
    setCompilationTime(state, action: PayloadAction<number>) {
      state.compilationTimeMs = action.payload;
    },
    clearMeasurements(state) {
      state.measurements = [];
    },
  },
});

export const { addMeasurement, setProcessingOverhead, setCompilationTime, clearMeasurements } =
  performanceSlice.actions;

export function getAverageSpeedupPercent(state: PerformanceState): number {
  if (state.measurements.length === 0) return 0;
  const total = state.measurements.reduce((sum, m) => {
    const speedup =
      ((m.loadTimeMsWithoutBlocking - m.loadTimeMsWithBlocking) / m.loadTimeMsWithoutBlocking) *
      100;
    return sum + speedup;
  }, 0);
  return total / state.measurements.length;
}

export default performanceSlice.reducer;
