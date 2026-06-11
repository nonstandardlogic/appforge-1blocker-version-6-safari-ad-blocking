import type { FilterList } from './types';

export const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000;

export type NetworkType = 'wifi' | 'cellular' | 'none';

export class FilterListUpdater {
  isStale(list: FilterList, now: Date = new Date()): boolean {
    const age = now.getTime() - new Date(list.lastUpdated).getTime();
    return age > UPDATE_INTERVAL_MS;
  }

  canUpdateOnNetwork(networkType: NetworkType, wifiOnly: boolean): boolean {
    if (networkType === 'none') return false;
    if (wifiOnly && networkType === 'cellular') return false;
    return true;
  }

  getListsNeedingUpdate(lists: FilterList[], now: Date = new Date()): FilterList[] {
    return lists.filter(l => l.enabled && this.isStale(l, now));
  }

  buildUpdatedList(list: FilterList, updatedAt: string, newRulesCount?: number): FilterList {
    return {
      ...list,
      lastUpdated: updatedAt,
      rulesCount: newRulesCount ?? list.rulesCount,
    };
  }
}
