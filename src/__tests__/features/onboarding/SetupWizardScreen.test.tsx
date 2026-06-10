import React from 'react';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {AppState, type AppStateStatus, Linking} from 'react-native';
import {SetupWizardScreen} from '../../../features/onboarding/screens/SetupWizardScreen';
import onboardingReducer from '../../../features/onboarding/onboardingSlice';

const mockCheckExtensionEnabled = jest.fn<Promise<boolean>, [string]>();

jest.mock('../../../native/modules/ContentBlockerModule', () => ({
  __esModule: true,
  default: {checkExtensionEnabled: mockCheckExtensionEnabled},
}));

type OnboardingOverride = Partial<{
  currentStep: 'welcome' | 'enable' | 'complete';
  isExtensionEnabled: boolean;
  hasCompletedOnboarding: boolean;
}>;

function makeStore(overrides?: OnboardingOverride) {
  return configureStore({
    reducer: {onboarding: onboardingReducer},
    preloadedState: overrides
      ? {
          onboarding: {
            currentStep: 'welcome' as const,
            isExtensionEnabled: false,
            hasCompletedOnboarding: false,
            ...overrides,
          },
        }
      : undefined,
  });
}

function renderWizard(overrides?: OnboardingOverride) {
  const store = makeStore(overrides);
  const utils = render(
    <Provider store={store}>
      <SetupWizardScreen />
    </Provider>,
  );
  return {...utils, store};
}

describe('SetupWizardScreen — NSL1V6SAB-9', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckExtensionEnabled.mockResolvedValue(false);
  });

  // AC1 ─────────────────────────────────────────────────────────────────────

  describe('AC1 – Multi-step wizard shown on first launch (not a blank screen)', () => {
    it('renders the welcome step on initial launch', () => {
      const {getByTestId} = renderWizard();
      expect(getByTestId('wizard-welcome')).toBeTruthy();
    });

    it('shows a Get Started button on the welcome step', () => {
      const {getByTestId} = renderWizard();
      expect(getByTestId('wizard-next-button')).toBeTruthy();
    });

    it('advances to the enable step when Get Started is tapped', () => {
      const {getByTestId, queryByTestId} = renderWizard();
      fireEvent.press(getByTestId('wizard-next-button'));
      expect(getByTestId('wizard-enable')).toBeTruthy();
      expect(queryByTestId('wizard-welcome')).toBeNull();
    });
  });

  // AC2 ─────────────────────────────────────────────────────────────────────

  describe('AC2 – "Enable in Safari Settings" deep-links to Content Blockers settings', () => {
    it('renders the Enable in Safari Settings button on the enable step', () => {
      const {getByTestId} = renderWizard({currentStep: 'enable'});
      expect(getByTestId('enable-in-safari-button')).toBeTruthy();
    });

    it('calls Linking.openURL with the iOS Content Blockers settings URL', () => {
      const {getByTestId} = renderWizard({currentStep: 'enable'});
      fireEvent.press(getByTestId('enable-in-safari-button'));
      expect(Linking.openURL).toHaveBeenCalledWith(
        'App-Prefs:root=SAFARI&path=ContentBlockers',
      );
    });
  });

  // AC3 ─────────────────────────────────────────────────────────────────────

  describe('AC3 – Wizard auto-advances when extension enabled on foreground return', () => {
    let capturedListener:
      | ((nextState: AppStateStatus) => Promise<void>)
      | undefined;

    beforeEach(() => {
      capturedListener = undefined;
      jest
        .spyOn(AppState, 'addEventListener')
        .mockImplementation((event, listener) => {
          if (event === 'change') {
            capturedListener = listener as (
              nextState: AppStateStatus,
            ) => Promise<void>;
          }
          return {remove: jest.fn()};
        });
    });

    it('advances to the complete step when extension is enabled on app foreground', async () => {
      mockCheckExtensionEnabled.mockResolvedValue(true);
      const {store} = renderWizard({currentStep: 'enable'});

      expect(capturedListener).toBeDefined();

      await act(async () => {
        await capturedListener!('active');
      });

      await waitFor(() => {
        expect(store.getState().onboarding.currentStep).toBe('complete');
      });
      expect(store.getState().onboarding.isExtensionEnabled).toBe(true);
    });

    it('remains on the enable step when extension is not yet enabled', async () => {
      mockCheckExtensionEnabled.mockResolvedValue(false);
      const {store} = renderWizard({currentStep: 'enable'});

      await act(async () => {
        await capturedListener?.('active');
      });

      expect(store.getState().onboarding.currentStep).toBe('enable');
    });
  });
});
