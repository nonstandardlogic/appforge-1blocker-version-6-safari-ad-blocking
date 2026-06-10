import {NativeModules} from 'react-native';

export interface BlockingStats {
  total: number;
  byCategory: {
    ads: number;
    trackers: number;
    annoyances: number;
  };
}

interface BlockingStatsModuleType {
  getStats(): Promise<BlockingStats>;
}

const native = (
  NativeModules as {BlockingStatsModule?: BlockingStatsModuleType}
).BlockingStatsModule;

export default {
  async getStats(): Promise<BlockingStats> {
    if (native?.getStats) {
      return native.getStats();
    }
    return {total: 0, byCategory: {ads: 0, trackers: 0, annoyances: 0}};
  },
};
