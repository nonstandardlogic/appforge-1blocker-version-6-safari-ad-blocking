import React from 'react';
import {AppState, Linking} from 'react-native';
import {act, fireEvent, render, waitFor} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {DashboardScreen} from '../../../features/onboarding/screens/DashboardScreen';
import {PermissionRepairScreen} from '../../../features/onboarding/screens/PermissionRepairScreen';
import onboardingReducer from '../../../features/onboarding/onboardingSlice';
import statsReducer from '../../../features/onboarding/statsSlice';

jest.mock('../../../native/modules/ContentBlockerModule', () => ({
  __esModule: true,
  default: {checkExtensionEnabled: jest.fn()},
}));

jest.mock('../../../native/modules/BlockingStatsModule', () => ({
  __esModule: true,
  default: {getStats: jest.fn()},
}));

const mockCheckExtensionEnabled = (
  jest.requireMock('../../../native/modules/ContentBlockerModule') as {
    default: {checkExtensionEnabled: jest.Mock};
  }
).default.checkExtensionEnabled;

const mockGetStats = (
  jest.requireMock('../../../native/modules/BlockingStatsModule') as {
    default: {getStats: jest.Mock};
  }
).default.getStats;

type OnboardingOverride = {
  isExtensionEnabled?: boolean;
};

function makeStore(overrides?: OnboardingOverride) {
  return configureStore({
    reducer: {onboarding: onboardingReducer, stats: statsReducer},
    preloadedState: overrides
      ? {
          onboarding: {
            currentStep: 'complete' as const,
            isExtensionEnabled: overrides.isExtensionEnabled ?? false,
            hasCompletedOnboarding: true,
          },
        }
      : undefined,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetStats.mockResolvedValue({
    total: 0,
    byCategory: {ads: 0, trackers: 0, annoyances: 0},
  });
  mockCheckExtensionEnabled.mockResolvedValue(false);
});

// AC1 ─────────────────────────────────────────────────────

describe('AC1 — prominent banner and Fix it button when extension is disabled', () => {
  it('renders the extension-disabled banner when the extension is off', async () => {
    const {getByTestId} = render(
      <Provider store={makeStore({isExtensionEnabled: false})}>
        <DashboardScreen />
      </Provider>,
    );
    await waitFor(() => {
      expect(getByTestId('extension-disabled-banner')).toBeTruthy();
    });
  });

  it('renders a Fix it button inside the banner', async () => {
    const {getByTestId} = render(
      <Provider store={makeStore({isExtensionEnabled: false})}>
        <DashboardScreen />
      </Provider>,
    );
    await waitFor(() => {
      expect(getByTestId('fix-it-button')).toBeTruthy();
    });
  });

  it('does not show the banner when the extension is enabled', async () => {
    mockCheckExtensionEnabled.mockResolvedValue(true);
    const {queryByTestId} = render(
      <Provider store={makeStore({isExtensionEnabled: true})}>
        <DashboardScreen />
      </Provider>,
    );
    await waitFor(() => {
      expect(queryByTestId('extension-disabled-banner')).toBeNull();
    });
  });
});

// AC2 ─────────────────────────────────────────────────────

describe('AC2 — repair screen with one-tap navigation to iOS Settings', () => {
  it('shows the permissions repair screen when Fix it is tapped', async () => {
    const {getByTestId} = render(
      <Provider store={makeStore({isExtensionEnabled: false})}>
        <DashboardScreen />
      </Provider>,
    );
    await waitFor(() => {
      expect(getByTestId('fix-it-button')).toBeTruthy();
    });
    fireEvent.press(getByTestId('fix-it-button'));
    expect(getByTestId('permission-repair-screen')).toBeTruthy();
  });

  it('calls Linking.openURL with the Content Blockers URL when the repair button is tapped', () => {
    const {getByTestId} = render(
      <Provider store={makeStore()}>
        <PermissionRepairScreen onRepaired={jest.fn()} />
      </Provider>,
    );
    fireEvent.press(getByTestId('open-safari-settings-button'));
    expect(Linking.openURL).toHaveBeenCalledWith(
      'App-Prefs:root=SAFARI&path=ContentBlockers',
    );
  });
});

// AC3 ─────────────────────────────────────────────────────

describe('AC3 — warning dismissed and active status shown after extension re-enabled', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls onRepaired when the extension is enabled on foreground return', async () => {
    let capturedHandler:
      | ((nextState: string) => Promise<void> | void)
      | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (_event: any, handler: any) => {
        capturedHandler = handler;
        return {remove: jest.fn()};
      },
    );
    mockCheckExtensionEnabled.mockResolvedValue(true);
    const onRepaired = jest.fn();

    render(
      <Provider store={makeStore()}>
        <PermissionRepairScreen onRepaired={onRepaired} />
      </Provider>,
    );

    await act(async () => {
      await capturedHandler?.('active');
    });

    expect(onRepaired).toHaveBeenCalledTimes(1);
  });

  it('does not call onRepaired when extension remains disabled on foreground return', async () => {
    let capturedHandler:
      | ((nextState: string) => Promise<void> | void)
      | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (_event: any, handler: any) => {
        capturedHandler = handler;
        return {remove: jest.fn()};
      },
    );
    mockCheckExtensionEnabled.mockResolvedValue(false);
    const onRepaired = jest.fn();

    render(
      <Provider store={makeStore()}>
        <PermissionRepairScreen onRepaired={onRepaired} />
      </Provider>,
    );

    await act(async () => {
      await capturedHandler?.('active');
    });

    expect(onRepaired).not.toHaveBeenCalled();
  });

  it('shows extension active status on the dashboard when extension is enabled', async () => {
    mockCheckExtensionEnabled.mockResolvedValue(true);
    const {getByTestId} = render(
      <Provider store={makeStore({isExtensionEnabled: true})}>
        <DashboardScreen />
      </Provider>,
    );
    await waitFor(() => {
      expect(getByTestId('extension-active-status')).toBeTruthy();
    });
  });
});
