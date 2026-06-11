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
import {useDispatch, useSelector} from 'react-redux';
import {
  completeOnboarding,
  setCurrentStep,
  setExtensionEnabled,
} from '../onboardingSlice';
import {useExtensionStatus} from '../hooks/useExtensionStatus';
import type {RootState} from '../../../shared/store';

const SAFARI_CONTENT_BLOCKERS_URL =
  'App-Prefs:root=SAFARI&path=ContentBlockers';

export function SetupWizardScreen(): React.JSX.Element {
  const dispatch = useDispatch();
  const {currentStep} = useSelector(
    (state: RootState) => state.onboarding,
  );
  const {checkEnabled} = useExtensionStatus();

  const handleOpenSafariSettings = useCallback(() => {
    void Linking.openURL(SAFARI_CONTENT_BLOCKERS_URL);
  }, []);

  const detectExtensionOnForeground = useCallback(
    async (nextState: AppStateStatus) => {
      if (nextState === 'active' && currentStep === 'enable') {
        const enabled = await checkEnabled();
        if (enabled) {
          dispatch(setExtensionEnabled(true));
          dispatch(setCurrentStep('complete'));
        }
      }
    },
    [checkEnabled, currentStep, dispatch],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      detectExtensionOnForeground,
    );
    return () => subscription.remove();
  }, [detectExtensionOnForeground]);

  if (currentStep === 'welcome') {
    return (
      <View style={styles.container} testID="wizard-welcome">
        <Text style={styles.title}>Welcome to 1Blocker</Text>
        <Text style={styles.subtitle}>
          Let's get you protected in under 2 minutes.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => dispatch(setCurrentStep('enable'))}
          testID="wizard-next-button">
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (currentStep === 'enable') {
    return (
      <View style={styles.container} testID="wizard-enable">
        <Text style={styles.title}>Enable Safari Protection</Text>
        <Text style={styles.subtitle}>
          Tap the button below, then turn on 1Blocker in the Content Blockers
          list.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleOpenSafariSettings}
          testID="enable-in-safari-button">
          <Text style={styles.buttonText}>Enable in Safari Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="wizard-complete">
      <Text style={styles.title}>You're protected!</Text>
      <Text style={styles.subtitle}>
        1Blocker is now blocking ads and trackers in Safari.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => dispatch(completeOnboarding())}
        testID="wizard-finish-button">
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
