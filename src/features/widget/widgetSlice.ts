import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetData {
  todayBlocked: number;
  topBlockedDomain: string | null;
  weeklyTrend: number[];
  lastUpdatedAt: string;
}

export interface WidgetState {
  data: WidgetData | null;
  availableSizes: WidgetSize[];
  selectedSize: WidgetSize;
  deepLinkDestination: 'statistics';
  updateIntervalMinutes: number;
}

export const MIN_UPDATE_INTERVAL_MINUTES = 15;
export const AVAILABLE_SIZES: WidgetSize[] = ['small', 'medium', 'large'];

const initialState: WidgetState = {
  data: null,
  availableSizes: AVAILABLE_SIZES,
  selectedSize: 'medium',
  deepLinkDestination: 'statistics',
  updateIntervalMinutes: MIN_UPDATE_INTERVAL_MINUTES,
};

const widgetSlice = createSlice({
  name: 'widget',
  initialState,
  reducers: {
    updateWidgetData(state, action: PayloadAction<WidgetData>) {
      state.data = action.payload;
    },
    setWidgetSize(state, action: PayloadAction<WidgetSize>) {
      state.selectedSize = action.payload;
    },
  },
});

export const { updateWidgetData, setWidgetSize } = widgetSlice.actions;

export default widgetSlice.reducer;
