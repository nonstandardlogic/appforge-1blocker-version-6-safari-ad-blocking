import React from 'react';
import {act, fireEvent, render} from '@testing-library/react-native';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {AllowlistScreen} from '../../../features/onboarding/screens/AllowlistScreen';
import allowlistReducer, {
  addEntry,
  addToAllowlist,
  type AllowlistEntry,
} from '../../../features/onboarding/allowlistSlice';
import onboardingReducer from '../../../features/onboarding/onboardingSlice';
import statsReducer from '../../../features/onboarding/statsSlice';

jest.mock('../../../native/modules/AllowlistModule', () => ({
  __esModule: true,
  default: {
    addDomain: jest.fn().mockResolvedValue(undefined),
    removeDomain: jest.fn().mockResolvedValue(undefined),
    getAllDomains: jest.fn().mockResolvedValue([]),
  },
}));

const mockAllowlistModule = (
  jest.requireMock('../../../native/modules/AllowlistModule') as {
    default: {
      addDomain: jest.Mock;
      removeDomain: jest.Mock;
      getAllDomains: jest.Mock;
    };
  }
).default;

function makeStore(allowlistEntries: AllowlistEntry[] = []) {
  return configureStore({
    reducer: {
      onboarding: onboardingReducer,
      stats: statsReducer,
      allowlist: allowlistReducer,
    },
    preloadedState: {
      allowlist: {entries: allowlistEntries, searchQuery: ''},
    },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

// AC1 ─────────────────────────────────────────────────────

describe('AC1 — share extension adds domain to allowlist', () => {
  it('adds a SHARE_EXTENSION entry to the store', () => {
    const store = makeStore();
    store.dispatch(
      addEntry({
        id: 'test-1',
        domain: 'example.com',
        addedAt: '2026-01-01T00:00:00.000Z',
        source: 'SHARE_EXTENSION',
      }),
    );
    const state = store.getState();
    expect(state.allowlist.entries).toHaveLength(1);
    expect(state.allowlist.entries[0].domain).toBe('example.com');
    expect(state.allowlist.entries[0].source).toBe('SHARE_EXTENSION');
  });

  it('does not add a duplicate domain from share extension', () => {
    const store = makeStore([
      {
        id: '1',
        domain: 'example.com',
        addedAt: '2026-01-01T00:00:00.000Z',
        source: 'SHARE_EXTENSION',
      },
    ]);
    store.dispatch(
      addEntry({
        id: '2',
        domain: 'example.com',
        addedAt: '2026-01-02T00:00:00.000Z',
        source: 'USER',
      }),
    );
    expect(store.getState().allowlist.entries).toHaveLength(1);
  });

  it('allowed entry appears in the AllowlistScreen', () => {
    const {getByTestId} = render(
      <Provider
        store={makeStore([
          {
            id: '1',
            domain: 'trusted.com',
            addedAt: '2026-01-01T00:00:00.000Z',
            source: 'SHARE_EXTENSION',
          },
        ])}>
        <AllowlistScreen />
      </Provider>,
    );
    expect(getByTestId('allowlist-entry-trusted.com')).toBeTruthy();
  });
});

// AC2 ─────────────────────────────────────────────────────

describe('AC2 — blocking disabled for allowlisted site', () => {
  it('calls AllowlistModule.addDomain with the correct domain', async () => {
    const store = makeStore();
    await store.dispatch(
      addToAllowlist({domain: 'example.com', source: 'USER'}),
    );
    expect(mockAllowlistModule.addDomain).toHaveBeenCalledWith('example.com');
  });

  it('adds the entry to the store after addDomain resolves', async () => {
    const store = makeStore();
    await store.dispatch(
      addToAllowlist({domain: 'example.com', source: 'USER'}),
    );
    const {entries} = store.getState().allowlist;
    expect(entries).toHaveLength(1);
    expect(entries[0].domain).toBe('example.com');
  });

  it('does not add a duplicate domain via addToAllowlist', async () => {
    const store = makeStore([
      {
        id: '1',
        domain: 'example.com',
        addedAt: '2026-01-01T00:00:00.000Z',
        source: 'USER',
      },
    ]);
    await store.dispatch(
      addToAllowlist({domain: 'example.com', source: 'USER'}),
    );
    expect(store.getState().allowlist.entries).toHaveLength(1);
  });
});

// AC3 ─────────────────────────────────────────────────────

describe('AC3 — view, search, and remove allowlisted sites', () => {
  const entries: AllowlistEntry[] = [
    {
      id: '1',
      domain: 'news.com',
      addedAt: '2026-01-01T00:00:00.000Z',
      source: 'USER',
    },
    {
      id: '2',
      domain: 'shop.io',
      addedAt: '2026-01-02T00:00:00.000Z',
      source: 'USER',
    },
  ];

  it('renders the allowlist screen', () => {
    const {getByTestId} = render(
      <Provider store={makeStore(entries)}>
        <AllowlistScreen />
      </Provider>,
    );
    expect(getByTestId('allowlist-screen')).toBeTruthy();
  });

  it('displays all allowlisted entries', () => {
    const {getByTestId} = render(
      <Provider store={makeStore(entries)}>
        <AllowlistScreen />
      </Provider>,
    );
    expect(getByTestId('allowlist-entry-news.com')).toBeTruthy();
    expect(getByTestId('allowlist-entry-shop.io')).toBeTruthy();
  });

  it('shows empty state when no entries exist', () => {
    const {getByTestId} = render(
      <Provider store={makeStore()}>
        <AllowlistScreen />
      </Provider>,
    );
    expect(getByTestId('allowlist-empty')).toBeTruthy();
  });

  it('filters entries by search query', () => {
    const {getByTestId, queryByTestId} = render(
      <Provider store={makeStore(entries)}>
        <AllowlistScreen />
      </Provider>,
    );
    fireEvent.changeText(getByTestId('allowlist-search-input'), 'news');
    expect(getByTestId('allowlist-entry-news.com')).toBeTruthy();
    expect(queryByTestId('allowlist-entry-shop.io')).toBeNull();
  });

  it('removes entry from store and calls removeDomain when remove is pressed', async () => {
    const store = makeStore(entries);
    const {getByTestId} = render(
      <Provider store={store}>
        <AllowlistScreen />
      </Provider>,
    );
    await act(async () => {
      fireEvent.press(getByTestId('remove-news.com'));
    });
    expect(mockAllowlistModule.removeDomain).toHaveBeenCalledWith('news.com');
    expect(store.getState().allowlist.entries).toHaveLength(1);
    expect(store.getState().allowlist.entries[0].domain).toBe('shop.io');
  });

  it('shows the search input', () => {
    const {getByTestId} = render(
      <Provider store={makeStore(entries)}>
        <AllowlistScreen />
      </Provider>,
    );
    expect(getByTestId('allowlist-search-input')).toBeTruthy();
  });
});
