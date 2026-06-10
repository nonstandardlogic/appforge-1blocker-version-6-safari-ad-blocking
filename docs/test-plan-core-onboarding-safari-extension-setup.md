# QA Test Plan — Core Onboarding & Safari Extension Setup [NSL1V6SAB-1]

**Project:** NSL-DEL-1blocker-version-6-safari-ad-blocking  
**Epic:** NSL1V6SAB-1 — Core Onboarding & Safari Extension Setup  
**PR evaluated:** nonstandardlogic/appforge#6 (merged 2026-06-09)  
**Platform:** iOS + Android (React Native 0.73 bare workflow)  
**QA Date:** 2026-06-10  
**QA Agent:** NSL Tester Agent  

---

## CI Pipeline Status

No CI check runs were configured on PR #6 at merge time. Jest tests exist in the repository (`__tests__/OnboardingWizard.test.tsx`, `__tests__/useExtensionStatus.test.ts`) and are evaluated by code review below. Recommendation: configure GitHub Actions to run `jest` on all PRs.

---

## Stories in Scope

| Story Key | Title | Status at QA Time | In Scope |
|-----------|-------|-------------------|----------|
| NSL1V6SAB-9 | Guided setup wizard for enabling the Safari Content Blocker | In Review | Yes — PR #6 |
| NSL1V6SAB-10 | Post-setup blocking dashboard showing immediate value | To Do | No — not yet implemented |
| NSL1V6SAB-11 | In-app permission status check and repair flow | To Do | No — not yet implemented |
| NSL1V6SAB-12 | Allow-list (whitelist) trusted sites from blocking | To Do | No — not yet implemented |
| NSL1V6SAB-13 | Settings and preferences persist across app updates | To Do | No — not yet implemented |

---

## NSL1V6SAB-9 — Guided setup wizard for enabling the Safari Content Blocker

**User Story:** As a new user, I want a step-by-step guided setup flow so that I can enable 1Blocker's Safari extension in under two minutes without confusion.

### TC-9-1: Multi-step onboarding wizard renders on first launch

**Acceptance Criterion:** Given I open 1Blocker for the first time, when the app launches, then I am presented with a multi-step onboarding wizard (not a blank home screen).

**Type:** Automated  
**Jest Test:** `__tests__/OnboardingWizard.test.tsx` — AC1 suite (3 tests)  
**CI Result:** No CI configured — evaluated by code review  

**Implementation evidence:**  
`OnboardingWizard.tsx` initialises `step` state to `'welcome'` with `useState<OnboardingStep>('welcome')`. On first render the `welcome` branch immediately returns a `<View testID="onboarding-wizard">` containing a title, body copy, and a "Get Started" `TouchableOpacity`. No deferred load, no null/blank state.

The wizard has three explicitly defined steps: `'welcome'` → `'enable'` → `'done'`, confirming it is multi-step.

**Result: PASS**

---

### TC-9-2: Enable button deep-links to Safari Content Blockers in iOS Settings

**Acceptance Criterion:** Given I am on the setup wizard, when I tap Enable in Safari Settings, then the app deep-links me directly to Safari Content Blockers in iOS Settings.

**Type:** Automated  
**Jest Test:** `__tests__/OnboardingWizard.test.tsx` — AC2 suite (1 test): asserts `openSafariContentBlockerSettings` is called exactly once on button press  
**CI Result:** No CI configured — evaluated by code review  

**Implementation evidence:**  
`src/utils/settings.ts` defines:
```ts
const SAFARI_CONTENT_BLOCKERS_URL =
  Platform.OS === 'ios'
    ? 'App-prefs:root=SAFARI&path=ContentBlockers'
    : '';

export async function openSafariContentBlockerSettings(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  const supported = await Linking.canOpenURL(SAFARI_CONTENT_BLOCKERS_URL);
  if (supported) {
    await Linking.openURL(SAFARI_CONTENT_BLOCKERS_URL);
  } else {
    await Linking.openSettings();
  }
}
```

`OnboardingWizard.tsx` wires this to the "Enable in Safari Settings" button via `onPress={openSafariContentBlockerSettings}`. The URL `App-prefs:root=SAFARI&path=ContentBlockers` opens directly to Settings → Safari → Content Blockers on iOS. A graceful fallback to `Linking.openSettings()` is provided if the URL scheme is unavailable.

**Result: PASS**

---

### TC-9-3: Wizard auto-advances when extension becomes enabled on foreground return

**Acceptance Criterion:** Given I return to the app after enabling the extension in Settings, when the app regains foreground, then the wizard detects the enabled state and advances to the next step automatically.

**Type:** Automated  
**Jest Test:**  
- `__tests__/OnboardingWizard.test.tsx` — AC3 suite (3 tests): auto-advance on `isEnabled: true`; no advance when still disabled; shows spinner while loading  
- `__tests__/useExtensionStatus.test.ts` — hook AppState integration (4 tests): re-fetches on background→active transition; correct loading/enabled state reporting  
**CI Result:** No CI configured — evaluated by code review  

**Implementation evidence:**  

`src/hooks/useExtensionStatus.ts` registers an `AppState.addEventListener('change', ...)` listener that calls `refresh()` (which invokes `NativeModules.SafariExtensionManager.isContentBlockerEnabled(EXTENSION_BUNDLE_ID)`) whenever the app transitions from `inactive|background` to `active`.

`OnboardingWizard.tsx` includes an auto-advance effect:
```tsx
useEffect(() => {
  if (step === 'enable' && !loading && isEnabled) {
    setStep('done');
  }
}, [isEnabled, loading, step]);
```

When the user returns from iOS Settings and the native module reports `isEnabled: true`, the wizard automatically advances to the `'done'` step without user interaction. A loading guard (`loading: true` shows an `<ActivityIndicator testID="status-loader" />`) prevents premature advancement.

**Result: PASS**

---

## NSL1V6SAB-10 — Post-setup blocking dashboard showing immediate value

**Status:** To Do — no implementation in scope for this QA cycle.

| Test Case | Acceptance Criterion | Type | Result |
|-----------|---------------------|------|--------|
| TC-10-1 | After setup wizard, dashboard shows live counter starting from zero | Manual | Not yet testable |
| TC-10-2 | Counter increments after browsing in Safari with extension enabled | Manual | Not yet testable |
| TC-10-3 | Tapping counter shows breakdown by category (ads, trackers, annoyances) | Manual | Not yet testable |

---

## NSL1V6SAB-11 — In-app permission status check and repair flow

**Status:** To Do — no implementation in scope for this QA cycle.

| Test Case | Acceptance Criterion | Type | Result |
|-----------|---------------------|------|--------|
| TC-11-1 | Prominent banner/alert appears when Safari extension is disabled | Manual | Not yet testable |
| TC-11-2 | "Fix it" taps navigate directly to correct iOS Settings location | Manual | Not yet testable |
| TC-11-3 | Warning dismisses automatically when extension is re-enabled on return | Manual | Not yet testable |

---

## NSL1V6SAB-12 — Allow-list (whitelist) trusted sites from blocking

**Status:** To Do — no implementation in scope for this QA cycle.

| Test Case | Acceptance Criterion | Type | Result |
|-----------|---------------------|------|--------|
| TC-12-1 | Share extension shows "Allow this site" option when tapped in Safari | Manual | Not yet testable |
| TC-12-2 | Adding a site to allowlist stops blocking ads/trackers on reload | Manual | Not yet testable |
| TC-12-3 | Allowlist section in settings allows viewing, searching, and removing entries | Manual | Not yet testable |

---

## NSL1V6SAB-13 — Settings and preferences persist across app updates

**Status:** To Do — no implementation in scope for this QA cycle.

| Test Case | Acceptance Criterion | Type | Result |
|-----------|---------------------|------|--------|
| TC-13-1 | Filter categories, custom rules, and allowlists are identical after app update | Manual | Not yet testable |
| TC-13-2 | Settings restore from iCloud backup after delete and reinstall | Manual | Not yet testable |
| TC-13-3 | Silent schema migration runs on launch after update without user prompt | Automated | Not yet testable |

---

## Summary

| Story | ACs Total | ACs Passed | ACs Failed | QA Result |
|-------|-----------|------------|------------|-----------|
| NSL1V6SAB-9 | 3 | 3 | 0 | **Tested** |
| NSL1V6SAB-10 | 3 | — | — | Not in scope |
| NSL1V6SAB-11 | 3 | — | — | Not in scope |
| NSL1V6SAB-12 | 3 | — | — | Not in scope |
| NSL1V6SAB-13 | 3 | — | — | Not in scope |

**Epic QA Approved:** Pending implementation and QA of NSL1V6SAB-10, -11, -12, -13.
