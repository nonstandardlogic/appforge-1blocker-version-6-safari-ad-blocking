import React, {useEffect, useCallback} from 'react';
import {View, Text, TouchableOpacity, AppState, StyleSheet} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import type {RootState, AppDispatch} from '../../../shared/store';
import {updateStats, toggleBreakdown} from '../statsSlice';
import BlockingStatsModule from '../../../native/modules/BlockingStatsModule';

export function DashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const {stats, showBreakdown} = useSelector((s: RootState) => s.stats);

  const refreshStats = useCallback(async () => {
    const fresh = await BlockingStatsModule.getStats();
    dispatch(updateStats(fresh));
  }, [dispatch]);

  useEffect(() => {
    refreshStats();
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        refreshStats();
      }
    });
    return () => sub.remove();
  }, [refreshStats]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID="stats-counter"
        onPress={() => dispatch(toggleBreakdown())}>
        <Text style={styles.counter} testID="total-count">
          {stats.total}
        </Text>
        <Text style={styles.label}>Ads & Trackers Blocked</Text>
      </TouchableOpacity>

      {showBreakdown && (
        <View testID="category-breakdown" style={styles.breakdown}>
          <Text style={styles.categoryRow}>Ads: {stats.byCategory.ads}</Text>
          <Text style={styles.categoryRow}>
            Trackers: {stats.byCategory.trackers}
          </Text>
          <Text style={styles.categoryRow}>
            Annoyances: {stats.byCategory.annoyances}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  counter: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  label: {fontSize: 16, color: '#8E8E93', textAlign: 'center', marginTop: 4},
  breakdown: {marginTop: 24, alignItems: 'center'},
  categoryRow: {fontSize: 18, marginVertical: 4},
});
