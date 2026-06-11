import reducer, {
  recordBatteryUsage,
  recordMemoryUsage,
  recordBackgroundTaskCpu,
  clearResourceMetrics,
  ResourceUsageState,
} from '../resourceUsageSlice';

const initial: ResourceUsageState = {
  batteryUsagePercent: null,
  memoryUsageMb: null,
  backgroundTaskCpuSeconds: null,
};

describe('resourceUsageSlice', () => {
  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('recordBatteryUsage sets batteryUsagePercent', () => {
    const state = reducer(initial, recordBatteryUsage(2.5));
    expect(state.batteryUsagePercent).toBe(2.5);
    expect(state.memoryUsageMb).toBeNull();
    expect(state.backgroundTaskCpuSeconds).toBeNull();
  });

  it('recordMemoryUsage sets memoryUsageMb', () => {
    const state = reducer(initial, recordMemoryUsage(48.3));
    expect(state.memoryUsageMb).toBe(48.3);
  });

  it('recordBackgroundTaskCpu sets backgroundTaskCpuSeconds', () => {
    const state = reducer(initial, recordBackgroundTaskCpu(0.12));
    expect(state.backgroundTaskCpuSeconds).toBe(0.12);
  });

  it('clearResourceMetrics resets all metrics to null', () => {
    const populated: ResourceUsageState = {
      batteryUsagePercent: 3.1,
      memoryUsageMb: 55.0,
      backgroundTaskCpuSeconds: 0.5,
    };
    const state = reducer(populated, clearResourceMetrics());
    expect(state).toEqual(initial);
  });

  it('updates can overwrite previous values', () => {
    let state = reducer(initial, recordBatteryUsage(1.0));
    state = reducer(state, recordBatteryUsage(2.0));
    expect(state.batteryUsagePercent).toBe(2.0);
  });
});
