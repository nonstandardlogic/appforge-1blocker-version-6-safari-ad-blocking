export interface PageLoadMeasurement {
  url: string;
  loadTimeMsWithBlocking: number;
  loadTimeMsWithoutBlocking: number;
}

export interface PerformanceState {
  measurements: PageLoadMeasurement[];
  processingOverheadMs: number;
  compilationTimeMs: number | null;
}
