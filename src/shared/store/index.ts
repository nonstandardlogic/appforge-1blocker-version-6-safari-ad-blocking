import { configureStore } from '@reduxjs/toolkit';
import blockingReducer from '../../features/blocking/blockingSlice';
import trackerLogReducer from '../../features/blocking/trackerLogSlice';

export const store = configureStore({
  reducer: {
    blocking: blockingReducer,
    trackerLog: trackerLogReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
