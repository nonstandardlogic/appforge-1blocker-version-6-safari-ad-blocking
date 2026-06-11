import {configureStore} from '@reduxjs/toolkit';
import allowlistReducer from '../../../features/onboarding/allowlistSlice';
import settingsReducer, {
  initializeSettings,
} from '../../../features/onboarding/settingsSlice';
import onboardingReducer from '../../../features/onboarding/onboardingSlice';
import statsReducer from '../../../features/onboarding/statsSlice';
import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_SETTINGS,
} from '../../../features/onboarding/migrationRunner';

// jest.mock() is hoisted before imports, so imported variables are out-of-scope.
// The 'mock' prefix is the documented exemption that bypasses this restriction.
const mockCurrentSchemaVersion = 1;

jest.mock('../../../native/modules/SettingsPersistenceModule', () => ({
  __esModule: true,
  default: {
    saveSettings: jest.fn().mockResolvedValue(undefined),
    loadSettings: jest.fn().mockResolvedValue(null),
    loadAllowlistFromCloud: jest.fn().mockResolvedValue([]),
    saveAllowlistToCloud: jest.fn().mockResolvedValue(undefined),
    getSchemaVersion: jest.fn().mockResolvedValue(mockCurrentSchemaVersion),
    setSchemaVersion: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockModule = (
  jest.requireMock('../../../native/modules/SettingsPersistenceModule') as {
    default: {
      saveSettings: jest.Mock;
      loadSettings: jest.Mock;
      loadAllowlistFromCloud: jest.Mock;
      saveAllowlistToCloud: jest.Mock;
      getSchemaVersion: jest.Mock;
      setSchemaVersion: jest.Mock;
    };
  }
).default;

function makeStore() {
  return configureStore({
    reducer: {
      onboarding: onboardingReducer,
      stats: statsReducer,
      allowlist: allowlistReducer,
      settings: settingsReducer,
    },
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockModule.getSchemaVersion.mockResolvedValue(CURRENT_SCHEMA_VERSION);
  mockModule.loadSettings.mockResolvedValue(null);
  mockModule.loadAllowlistFromCloud.mockResolvedValue([]);
});

// AC1 ─────────────────────────────────────────────────────

describe('AC1 — settings identical to saved values after app update', () => {
  it('loads persisted settings from storage on initialisation', async () => {
    const saved = {
      ...DEFAULT_SETTINGS,
      wifiOnlyUpdates: false,
      enableDarkMode: 'DARK' as const,
      notificationsEnabled: false,
    };
    mockModule.loadSettings.mockResolvedValue(saved);

    const store = makeStore();
    await store.dispatch(initializeSettings());

    const {settings} = store.getState().settings;
    expect(settings.wifiOnlyUpdates).toBe(false);
    expect(settings.enableDarkMode).toBe('DARK');
    expect(settings.notificationsEnabled).toBe(false);
  });

  it('marks settings as loaded after initialisation', async () => {
    mockModule.loadSettings.mockResolvedValue(DEFAULT_SETTINGS);
    const store = makeStore();
    await store.dispatch(initializeSettings());
    expect(store.getState().settings.isLoaded).toBe(true);
  });

  it('falls back to defaults when storage returns null', async () => {
    mockModule.loadSettings.mockResolvedValue(null);
    const store = makeStore();
    await store.dispatch(initializeSettings());
    expect(store.getState().settings.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('preserves all saved fields unchanged', async () => {
    const saved = {
      ...DEFAULT_SETTINGS,
      filterUpdateFrequency: 'WEEKLY' as const,
      iCloudSyncEnabled: false,
    };
    mockModule.loadSettings.mockResolvedValue(saved);

    const store = makeStore();
    await store.dispatch(initializeSettings());

    const {settings} = store.getState().settings;
    expect(settings.filterUpdateFrequency).toBe('WEEKLY');
    expect(settings.iCloudSyncEnabled).toBe(false);
  });
});

// AC2 ─────────────────────────────────────────────────────

describe('AC2 — allowlist restored from iCloud on reinstall', () => {
  it('populates the allowlist from iCloud when iCloudSyncEnabled is true', async () => {
    mockModule.loadSettings.mockResolvedValue({
      ...DEFAULT_SETTINGS,
      iCloudSyncEnabled: true,
    });
    mockModule.loadAllowlistFromCloud.mockResolvedValue([
      'example.com',
      'trusted.io',
    ]);

    const store = makeStore();
    await store.dispatch(initializeSettings());

    const {entries} = store.getState().allowlist;
    expect(entries).toHaveLength(2);
    expect(entries[0].domain).toBe('example.com');
    expect(entries[1].domain).toBe('trusted.io');
  });

  it('does not call loadAllowlistFromCloud when iCloudSyncEnabled is false', async () => {
    mockModule.loadSettings.mockResolvedValue({
      ...DEFAULT_SETTINGS,
      iCloudSyncEnabled: false,
    });

    const store = makeStore();
    await store.dispatch(initializeSettings());

    expect(mockModule.loadAllowlistFromCloud).not.toHaveBeenCalled();
    expect(store.getState().allowlist.entries).toHaveLength(0);
  });

  it('restored allowlist entries have source USER', async () => {
    mockModule.loadSettings.mockResolvedValue({
      ...DEFAULT_SETTINGS,
      iCloudSyncEnabled: true,
    });
    mockModule.loadAllowlistFromCloud.mockResolvedValue(['shop.com']);

    const store = makeStore();
    await store.dispatch(initializeSettings());

    expect(store.getState().allowlist.entries[0].source).toBe('USER');
  });
});

// AC3 ─────────────────────────────────────────────────────

describe('AC3 — silent migration on schema version change', () => {
  it('runs migration when stored version is below current', async () => {
    mockModule.getSchemaVersion.mockResolvedValue(0);
    mockModule.loadSettings.mockResolvedValue({});

    const store = makeStore();
    await store.dispatch(initializeSettings());

    expect(mockModule.saveSettings).toHaveBeenCalled();
    expect(mockModule.setSchemaVersion).toHaveBeenCalledWith(
      CURRENT_SCHEMA_VERSION,
    );
  });

  it('records current schema version in the store after migration', async () => {
    mockModule.getSchemaVersion.mockResolvedValue(0);
    mockModule.loadSettings.mockResolvedValue({});

    const store = makeStore();
    await store.dispatch(initializeSettings());

    expect(store.getState().settings.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });

  it('skips migration when schema is already current', async () => {
    mockModule.getSchemaVersion.mockResolvedValue(CURRENT_SCHEMA_VERSION);
    mockModule.loadSettings.mockResolvedValue(DEFAULT_SETTINGS);

    const store = makeStore();
    await store.dispatch(initializeSettings());

    expect(mockModule.setSchemaVersion).not.toHaveBeenCalled();
    expect(mockModule.saveSettings).not.toHaveBeenCalled();
  });

  it('migration fills missing keys with defaults without user prompt', async () => {
    mockModule.getSchemaVersion.mockResolvedValue(0);
    mockModule.loadSettings.mockResolvedValue({filterUpdateFrequency: 'WEEKLY'});

    const store = makeStore();
    await store.dispatch(initializeSettings());

    const savedArg = mockModule.saveSettings.mock
      .calls[0][0] as Record<string, unknown>;
    expect(savedArg.filterUpdateFrequency).toBe('WEEKLY');
    expect(savedArg.notificationsEnabled).toBe(true);
    expect(savedArg.wifiOnlyUpdates).toBe(true);
  });
});
