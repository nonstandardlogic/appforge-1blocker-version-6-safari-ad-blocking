import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

export type WizardStep = 'welcome' | 'enable' | 'complete';

interface OnboardingState {
  currentStep: WizardStep;
  isExtensionEnabled: boolean;
  hasCompletedOnboarding: boolean;
}

const initialState: OnboardingState = {
  currentStep: 'welcome',
  isExtensionEnabled: false,
  hasCompletedOnboarding: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep(state, action: PayloadAction<WizardStep>) {
      state.currentStep = action.payload;
    },
    setExtensionEnabled(state, action: PayloadAction<boolean>) {
      state.isExtensionEnabled = action.payload;
    },
    completeOnboarding(state) {
      state.hasCompletedOnboarding = true;
    },
  },
});

export const {setCurrentStep, setExtensionEnabled, completeOnboarding} =
  onboardingSlice.actions;
export default onboardingSlice.reducer;
