import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ResourceUsageState {
  batteryUsagePercent: number | null;
  memoryUsageMb: number | null;
  backgroundTaskCpuSeconds: number | null;
}

const initialState: ResourceUsageState = {
  batteryUsagePercent: null,
  memoryUsageMb: null,
  backgroundTaskCpuSeconds: null,
};

const resourceUsageSlice = createSlice({
  name: 'resourceUsage',
  initialState,
  reducers: {
    recordBatteryUsage(state, action: PayloadAction<number>) {
      state.batteryUsagePercent = action.payload;
    },
    recordMemoryUsage(state, action: PayloadAction<number>) {
      state.memoryUsageMb = action.payload;
    },
    recordBackgroundTaskCpu(state, action: PayloadAction<number>) {
      state.backgroundTaskCpuSeconds = action.payload;
    },
    clearResourceMetrics(state) {
      state.batteryUsagePercent = null;
      state.memoryUsageMb = null;
      state.backgroundTaskCpuSeconds = null;
    },
  },
});

export const {
  recordBatteryUsage,
  recordMemoryUsage,
  recordBackgroundTaskCpu,
  clearResourceMetrics,
} = resourceUsageSlice.actions;

export default resourceUsageSlice.reducer;
