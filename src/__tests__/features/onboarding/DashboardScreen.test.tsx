import React from 'react';
import {AppState} from 'react-native';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {DashboardScreen} from '../../../features/onboarding/screens/DashboardScreen';
import statsReducer from '../../../features/onboarding/statsSlice';
import onboardingReducer from '../../../features/onboarding/onboardingSlice';
import BlockingStatsModule from '../../../native/modules/BlockingStatsModule';

jest.mock('../../../native/modules/BlockingStatsModule', () => ({
  __esModule: true,
  default: {
    getStats: jest.fn(),
  },
}));

function makeStore() {
  return configureStore({
    reducer: {
      onboarding: onboardingReducer,
      stats: statsReducer,
    },
  });
}

function renderDashboard() {
  return render(
    <Provider store={makeStore()}>
      <DashboardScreen />
    </Provider>,
  );
}

const mockGetStats = jest.mocked(BlockingStatsModule.getStats);

beforeEach(() => {
  mockGetStats.mockReset();
});

describe('AC1 — counter starts at zero after setup wizard', () => {
  beforeEach(() => {
    mockGetStats.mockResolvedValue({
      total: 0,
      byCategory: {ads: 0, trackers: 0, annoyances: 0},
    });
  });

  it('shows a total blocked counter of zero on first load', async () => {
    const {getByTestId} = renderDashboard();
    await waitFor(() => {
      expect(getByTestId('total-count').props.children).toBe(0);
    });
  });
});

describe('AC2 — counter increments when app returns to foreground', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('refreshes stats when AppState transitions to active', async () => {
    let appStateHandler: ((state: string) => void) | undefined;
    const removeMock = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (_event: any, handler: any) => {
        appStateHandler = handler;
        return {remove: removeMock} as any;
      },
    );

    mockGetStats
      .mockResolvedValueOnce({
        total: 0,
        byCategory: {ads: 0, trackers: 0, annoyances: 0},
      })
      .mockResolvedValueOnce({
        total: 5,
        byCategory: {ads: 3, trackers: 2, annoyances: 0},
      });

    const {getByTestId} = renderDashboard();

    await waitFor(() => {
      expect(getByTestId('total-count').props.children).toBe(0);
    });

    await act(async () => {
      appStateHandler?.('active');
    });

    await waitFor(() => {
      expect(getByTestId('total-count').props.children).toBe(5);
    });
  });
});

describe('AC3 — tapping counter reveals category breakdown', () => {
  beforeEach(() => {
    mockGetStats.mockResolvedValue({
      total: 7,
      byCategory: {ads: 4, trackers: 2, annoyances: 1},
    });
  });

  it('hides the category breakdown initially', async () => {
    const {getByTestId, queryByTestId} = renderDashboard();
    await waitFor(() => {
      expect(getByTestId('stats-counter')).toBeTruthy();
    });
    expect(queryByTestId('category-breakdown')).toBeNull();
  });

  it('shows breakdown with ads, trackers, and annoyances when counter is tapped', async () => {
    const {getByTestId} = renderDashboard();

    await waitFor(() => {
      expect(getByTestId('stats-counter')).toBeTruthy();
    });

    fireEvent.press(getByTestId('stats-counter'));

    expect(getByTestId('category-breakdown')).toBeTruthy();
  });
});
