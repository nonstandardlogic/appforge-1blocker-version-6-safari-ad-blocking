import {NativeModules} from 'react-native';

export interface AppSettings {
  filterUpdateFrequency: 'DAILY' | 'WEEKLY' | 'MANUAL';
  wifiOnlyUpdates: boolean;
  enableDarkMode: 'SYSTEM' | 'LIGHT' | 'DARK';
  notificationsEnabled: boolean;
  iCloudSyncEnabled: boolean;
  lastFilterUpdateCheck: string | null;
}

interface SettingsPersistenceModuleType {
  saveSettings(settings: AppSettings): Promise<void>;
  loadSettings(): Promise<AppSettings | null>;
  loadAllowlistFromCloud(): Promise<string[]>;
  saveAllowlistToCloud(domains: string[]): Promise<void>;
  getSchemaVersion(): Promise<number>;
  setSchemaVersion(version: number): Promise<void>;
}

const native = (
  NativeModules as {SettingsPersistenceModule?: SettingsPersistenceModuleType}
).SettingsPersistenceModule;

export default {
  async saveSettings(settings: AppSettings): Promise<void> {
    if (native?.saveSettings) {
      return native.saveSettings(settings);
    }
  },
  async loadSettings(): Promise<AppSettings | null> {
    if (native?.loadSettings) {
      return native.loadSettings();
    }
    return null;
  },
  async loadAllowlistFromCloud(): Promise<string[]> {
    if (native?.loadAllowlistFromCloud) {
      return native.loadAllowlistFromCloud();
    }
    return [];
  },
  async saveAllowlistToCloud(domains: string[]): Promise<void> {
    if (native?.saveAllowlistToCloud) {
      return native.saveAllowlistToCloud(domains);
    }
  },
  async getSchemaVersion(): Promise<number> {
    if (native?.getSchemaVersion) {
      return native.getSchemaVersion();
    }
    return 0;
  },
  async setSchemaVersion(version: number): Promise<void> {
    if (native?.setSchemaVersion) {
      return native.setSchemaVersion(version);
    }
  },
};
