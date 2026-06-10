import SettingsPersistenceModule, {
  type AppSettings,
} from '../../native/modules/SettingsPersistenceModule';

export const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS: AppSettings = {
  filterUpdateFrequency: 'DAILY',
  wifiOnlyUpdates: true,
  enableDarkMode: 'SYSTEM',
  notificationsEnabled: true,
  iCloudSyncEnabled: true,
  lastFilterUpdateCheck: null,
};

type MigrationFn = (saved: Partial<AppSettings>) => AppSettings;

const migrations: Record<number, MigrationFn> = {
  // v0 → v1: fill defaults for any key absent in a pre-v1 install
  1: saved => ({...DEFAULT_SETTINGS, ...saved}),
};

export async function runMigrations(fromVersion: number): Promise<void> {
  for (let v = fromVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const migrateFn = migrations[v];
    if (migrateFn) {
      const current =
        ((await SettingsPersistenceModule.loadSettings()) as Partial<AppSettings> | null) ?? {};
      const migrated = migrateFn(current);
      await SettingsPersistenceModule.saveSettings(migrated);
    }
    await SettingsPersistenceModule.setSchemaVersion(v);
  }
}
