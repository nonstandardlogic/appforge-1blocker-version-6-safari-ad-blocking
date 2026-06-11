import {createAsyncThunk, createSlice, type PayloadAction} from '@reduxjs/toolkit';
import SettingsPersistenceModule, {
  type AppSettings,
} from '../../native/modules/SettingsPersistenceModule';
import {
  runMigrations,
  CURRENT_SCHEMA_VERSION,
  DEFAULT_SETTINGS,
} from './migrationRunner';
import {setEntries} from './allowlistSlice';
import type {AllowlistEntry} from './allowlistSlice';

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;
  schemaVersion: number;
}

const initialState: SettingsState = {
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
  schemaVersion: 0,
};

export const initializeSettings = createAsyncThunk(
  'settings/initialize',
  async (_: void, {dispatch}) => {
    const storedVersion = await SettingsPersistenceModule.getSchemaVersion();

    if (storedVersion < CURRENT_SCHEMA_VERSION) {
      await runMigrations(storedVersion);
    }

    const saved = await SettingsPersistenceModule.loadSettings();
    const settings: AppSettings = saved ?? DEFAULT_SETTINGS;

    if (settings.iCloudSyncEnabled) {
      const cloudDomains =
        await SettingsPersistenceModule.loadAllowlistFromCloud();
      const entries: AllowlistEntry[] = cloudDomains.map(domain => ({
        id: `cloud-${domain}`,
        domain,
        addedAt: new Date().toISOString(),
        source: 'USER' as const,
      }));
      dispatch(setEntries(entries));
    }

    return {settings, schemaVersion: CURRENT_SCHEMA_VERSION};
  },
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings(
      state,
      action: PayloadAction<Partial<AppSettings>>,
    ) {
      state.settings = {...state.settings, ...action.payload};
    },
  },
  extraReducers: builder => {
    builder.addCase(initializeSettings.fulfilled, (state, action) => {
      state.settings = action.payload.settings;
      state.schemaVersion = action.payload.schemaVersion;
      state.isLoaded = true;
    });
  },
});

export const {setSettings} = settingsSlice.actions;
export default settingsSlice.reducer;
export type {AppSettings};
