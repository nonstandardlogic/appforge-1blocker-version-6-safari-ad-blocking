import { configureStore } from '@reduxjs/toolkit';
import blockingReducer from '../../features/blocking/blockingSlice';

export const store = configureStore({
  reducer: {
    blocking: blockingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
