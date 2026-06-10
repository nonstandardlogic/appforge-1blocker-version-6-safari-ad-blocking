import {configureStore} from '@reduxjs/toolkit';
import onboardingReducer from '../../features/onboarding/onboardingSlice';
import statsReducer from '../../features/onboarding/statsSlice';
import allowlistReducer from '../../features/onboarding/allowlistSlice';
import settingsReducer from '../../features/onboarding/settingsSlice';

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    stats: statsReducer,
    allowlist: allowlistReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
