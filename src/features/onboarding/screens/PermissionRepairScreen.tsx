import React, {useCallback, useEffect} from 'react';
import {
  AppState,
  type AppStateStatus,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import type {AppDispatch} from '../../../shared/store';
import {setExtensionEnabled} from '../onboardingSlice';
import {useExtensionStatus} from '../hooks/useExtensionStatus';

const SAFARI_CONTENT_BLOCKERS_URL = 'App-Prefs:root=SAFARI&path=ContentBlockers';

interface Props {
  onRepaired: () => void;
}

export function PermissionRepairScreen({onRepaired}: Props): React.JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const {checkEnabled} = useExtensionStatus();

  const handleOpenSettings = useCallback(() => {
    void Linking.openURL(SAFARI_CONTENT_BLOCKERS_URL);
  }, []);

  const handleForeground = useCallback(
    async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        const enabled = await checkEnabled();
        if (enabled) {
          dispatch(setExtensionEnabled(true));
          onRepaired();
        }
      }
    },
    [checkEnabled, dispatch, onRepaired],
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', handleForeground);
    return () => sub.remove();
  }, [handleForeground]);

  return (
    <View style={styles.container} testID="permission-repair-screen">
      <Text style={styles.title}>Safari Blocking Disabled</Text>
      <Text style={styles.description}>
        1Blocker's Safari Content Blocker needs to be re-enabled. Tap below to
        go directly to the correct iOS Settings screen.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleOpenSettings}
        testID="open-safari-settings-button">
        <Text style={styles.buttonText}>Open Safari Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {color: '#FFF', fontSize: 16, fontWeight: '600'},
});
