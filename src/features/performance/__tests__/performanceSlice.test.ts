import reducer, {
  addMeasurement,
  setProcessingOverhead,
  setCompilationTime,
  clearMeasurements,
  getAverageSpeedupPercent,
} from '../performanceSlice';
import { PerformanceState } from '../types';

const initial: PerformanceState = {
  measurements: [],
  processingOverheadMs: 0,
  compilationTimeMs: null,
};

describe('performanceSlice', () => {
  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('addMeasurement appends a measurement', () => {
    const measurement = { url: 'https://example.com', loadTimeMsWithBlocking: 800, loadTimeMsWithoutBlocking: 1000 };
    const state = reducer(initial, addMeasurement(measurement));
    expect(state.measurements).toHaveLength(1);
    expect(state.measurements[0]).toEqual(measurement);
  });

  it('addMeasurement accumulates multiple measurements', () => {
    let state = reducer(initial, addMeasurement({ url: 'a', loadTimeMsWithBlocking: 500, loadTimeMsWithoutBlocking: 1000 }));
    state = reducer(state, addMeasurement({ url: 'b', loadTimeMsWithBlocking: 400, loadTimeMsWithoutBlocking: 800 }));
    expect(state.measurements).toHaveLength(2);
  });

  it('setProcessingOverhead updates overhead', () => {
    const state = reducer(initial, setProcessingOverhead(5));
    expect(state.processingOverheadMs).toBe(5);
  });

  it('setCompilationTime sets compilationTimeMs', () => {
    const state = reducer(initial, setCompilationTime(120));
    expect(state.compilationTimeMs).toBe(120);
  });

  it('clearMeasurements empties measurements', () => {
    let state = reducer(initial, addMeasurement({ url: 'x', loadTimeMsWithBlocking: 100, loadTimeMsWithoutBlocking: 200 }));
    state = reducer(state, clearMeasurements());
    expect(state.measurements).toHaveLength(0);
  });
});

describe('getAverageSpeedupPercent', () => {
  it('returns 0 with no measurements', () => {
    expect(getAverageSpeedupPercent(initial)).toBe(0);
  });

  it('computes speedup for a single measurement', () => {
    // (1000 - 800) / 1000 * 100 = 20%
    const state: PerformanceState = {
      ...initial,
      measurements: [{ url: 'a', loadTimeMsWithBlocking: 800, loadTimeMsWithoutBlocking: 1000 }],
    };
    expect(getAverageSpeedupPercent(state)).toBeCloseTo(20);
  });

  it('averages speedup across multiple measurements', () => {
    // m1: (1000-800)/1000*100 = 20%
    // m2: (800-400)/800*100 = 50%
    // avg = 35%
    const state: PerformanceState = {
      ...initial,
      measurements: [
        { url: 'a', loadTimeMsWithBlocking: 800, loadTimeMsWithoutBlocking: 1000 },
        { url: 'b', loadTimeMsWithBlocking: 400, loadTimeMsWithoutBlocking: 800 },
      ],
    };
    expect(getAverageSpeedupPercent(state)).toBeCloseTo(35);
  });
});
