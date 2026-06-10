import {configureStore} from '@reduxjs/toolkit';
import onboardingReducer from '../../features/onboarding/onboardingSlice';
import statsReducer from '../../features/onboarding/statsSlice';

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    stats: statsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
