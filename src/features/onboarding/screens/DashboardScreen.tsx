import React, {useCallback, useEffect, useState} from 'react';
import {AppState, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import type {RootState, AppDispatch} from '../../../shared/store';
import {updateStats, toggleBreakdown} from '../statsSlice';
import {setExtensionEnabled} from '../onboardingSlice';
import BlockingStatsModule from '../../../native/modules/BlockingStatsModule';
import {useExtensionStatus} from '../hooks/useExtensionStatus';
import {PermissionRepairScreen} from './PermissionRepairScreen';

export function DashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const {stats, showBreakdown} = useSelector((s: RootState) => s.stats);
  const {isExtensionEnabled} = useSelector((s: RootState) => s.onboarding);
  const {checkEnabled} = useExtensionStatus();
  const [showRepairScreen, setShowRepairScreen] = useState(false);

  const refreshStats = useCallback(async () => {
    const fresh = await BlockingStatsModule.getStats();
    dispatch(updateStats(fresh));
  }, [dispatch]);

  const checkExtensionStatus = useCallback(async () => {
    const enabled = await checkEnabled();
    dispatch(setExtensionEnabled(enabled));
  }, [checkEnabled, dispatch]);

  useEffect(() => {
    refreshStats();
    checkExtensionStatus();
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        refreshStats();
        checkExtensionStatus();
      }
    });
    return () => sub.remove();
  }, [refreshStats, checkExtensionStatus]);

  if (showRepairScreen) {
    return (
      <PermissionRepairScreen onRepaired={() => setShowRepairScreen(false)} />
    );
  }

  return (
    <View style={styles.container}>
      {!isExtensionEnabled && (
        <View style={styles.banner} testID="extension-disabled-banner">
          <Text style={styles.bannerText}>
            Safari blocking is disabled. Your browsing is not protected.
          </Text>
          <TouchableOpacity
            onPress={() => setShowRepairScreen(true)}
            testID="fix-it-button">
            <Text style={styles.fixItText}>Fix it</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        testID="stats-counter"
        onPress={() => dispatch(toggleBreakdown())}>
        <Text style={styles.counter} testID="total-count">
          {stats.total}
        </Text>
        <Text style={styles.label}>Ads & Trackers Blocked</Text>
      </TouchableOpacity>

      {isExtensionEnabled && (
        <View testID="extension-active-status" style={styles.activeStatus}>
          <Text style={styles.activeText}>Protection Active</Text>
        </View>
      )}

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
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerText: {color: '#FFF', fontSize: 14, flex: 1, marginRight: 8},
  fixItText: {color: '#FFF', fontSize: 14, fontWeight: '700'},
  counter: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  label: {fontSize: 16, color: '#8E8E93', textAlign: 'center', marginTop: 4},
  activeStatus: {marginTop: 12},
  activeText: {fontSize: 15, color: '#34C759', fontWeight: '600'},
  breakdown: {marginTop: 24, alignItems: 'center'},
  categoryRow: {fontSize: 18, marginVertical: 4},
});
