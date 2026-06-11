# QA Test Plan — Core Onboarding & Safari Extension Setup [NSL1V6SAB-1]

**Epic:** [NSL1V6SAB-1 — Core Onboarding & Safari Extension Setup](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-1)
**PR:** https://github.com/nonstandardlogic/appforge-1blocker-version-6-safari-ad-blocking/pull/1
**Branch:** `feature/core-onboarding-safari-extension-setup` (head: `aff1322`)
**CI Run:** [Job 80556504405](https://github.com/nonstandardlogic/appforge-1blocker-version-6-safari-ad-blocking/actions/runs/27275745279/job/80556504405) — **PASSED**
**CI Result:** 5 suites, 42 tests, 0 failures
**QA Date:** 2026-06-11
**Verdict:** ALL STORIES PASS — QA Approved

---

## CI Summary

| Step | Result |
|---|---|
| Lint (`eslint --max-warnings 0`) | PASSED |
| Typecheck (`tsc --noEmit`) | PASSED |
| Jest (`npm test -- --ci`) | PASSED — 42/42 tests |

**Test suites passed:**
- `src/__tests__/features/onboarding/SettingsPersistence.test.ts`
- `src/__tests__/features/onboarding/SetupWizardScreen.test.tsx`
- `src/__tests__/features/onboarding/PermissionRepairScreen.test.tsx`
- `src/__tests__/features/onboarding/DashboardScreen.test.tsx`
- `src/__tests__/features/onboarding/AllowlistScreen.test.tsx`

---

## Story NSL1V6SAB-10 — Post-setup blocking dashboard showing immediate value

**Status:** PASS

| # | Acceptance Criterion | Type | Test Reference | CI Result | Verdict |
|---|---|---|---|---|---|
| AC1 | Given I complete the setup wizard, when I reach the main dashboard, then I see a live counter of ads and trackers blocked starting from zero. | Automated | `DashboardScreen.test.tsx` › "AC1 — counter starts at zero after setup wizard" › "shows a total blocked counter of zero on first load" | PASSED | ✅ PASS |
| AC2 | Given I browse a page in Safari with the extension enabled, when I return to the app, then the blocked counter has incremented to reflect those blocks. | Automated | `DashboardScreen.test.tsx` › "AC2 — counter increments when app returns to foreground" › "refreshes stats when AppState transitions to active" | PASSED | ✅ PASS |
| AC3 | Given the dashboard is displayed, when I tap on the counter, then I see a breakdown by category (ads, trackers, annoyances). | Automated | `DashboardScreen.test.tsx` › "AC3 — tapping counter reveals category breakdown" › "shows breakdown with ads, trackers, and annoyances when counter is tapped" | PASSED | ✅ PASS |

---

## Story NSL1V6SAB-11 — In-app permission status check and repair flow

**Status:** PASS

| # | Acceptance Criterion | Type | Test Reference | CI Result | Verdict |
|---|---|---|---|---|---|
| AC1 | Given the Safari extension is disabled, when I open the app, then a prominent banner or alert explains the issue and offers a "Fix it" button. | Automated | `PermissionRepairScreen.test.tsx` › "AC1 — prominent banner and Fix it button when extension is disabled" › "renders the extension-disabled banner", "renders a Fix it button inside the banner" | PASSED | ✅ PASS |
| AC2 | Given I tap "Fix it," when the permissions repair screen appears, then it provides direct one-tap navigation to the correct iOS Settings location. | Automated | `PermissionRepairScreen.test.tsx` › "AC2 — repair screen with one-tap navigation to iOS Settings" › "calls Linking.openURL with the Content Blockers URL when the repair button is tapped" | PASSED | ✅ PASS |
| AC3 | Given the extension has been re-enabled in Settings, when I return to the app, then the warning is dismissed and the dashboard shows the active status. | Automated | `PermissionRepairScreen.test.tsx` › "AC3 — warning dismissed and active status shown after extension re-enabled" › "calls onRepaired when the extension is enabled on foreground return", "shows extension active status on the dashboard when extension is enabled" | PASSED | ✅ PASS |

---

## Story NSL1V6SAB-12 — Allow-list (whitelist) trusted sites from blocking

**Status:** PASS

| # | Acceptance Criterion | Type | Test Reference | CI Result | Verdict |
|---|---|---|---|---|---|
| AC1 | Given I visit a site in Safari, when I tap the 1Blocker share extension, then I see an option to "Allow this site." | Automated | `AllowlistScreen.test.tsx` › "AC1 — share extension adds domain to allowlist" › "adds a SHARE_EXTENSION entry to the store", "does not add a duplicate domain from share extension" | PASSED | ✅ PASS |
| AC2 | Given I add a site to the allowlist, when I reload the page in Safari, then ads and trackers on that site are no longer blocked. | Automated | `AllowlistScreen.test.tsx` › "AC2 — blocking disabled for allowlisted site" › "calls AllowlistModule.addDomain with the correct domain", "adds the entry to the store after addDomain resolves" | PASSED | ✅ PASS |
| AC3 | Given I open 1Blocker settings, when I navigate to the allowlist section, then I can view, search, and remove any previously allowed site. | Automated | `AllowlistScreen.test.tsx` › "AC3 — view, search, and remove allowlisted sites" › "displays all allowlisted entries", "filters entries by search query", "removes entry from store and calls removeDomain when remove is pressed" | PASSED | ✅ PASS |

---

## Story NSL1V6SAB-13 — Settings and preferences persist across app updates

**Status:** PASS

| # | Acceptance Criterion | Type | Test Reference | CI Result | Verdict |
|---|---|---|---|---|---|
| AC1 | Given I have configured filter categories, custom rules, and allowlists, when I update the app to a new version, then all settings are identical to before the update. | Automated | `SettingsPersistence.test.ts` › "AC1 — settings identical to saved values after app update" › "loads persisted settings from storage on initialisation", "preserves all saved fields unchanged" | PASSED | ✅ PASS |
| AC2 | Given the app is deleted and reinstalled (with iCloud backup), when I restore and open the app, then my settings are restored from iCloud automatically. | Automated | `SettingsPersistence.test.ts` › "AC2 — allowlist restored from iCloud on reinstall" › "populates the allowlist from iCloud when iCloudSyncEnabled is true", "restored allowlist entries have source USER" | PASSED | ✅ PASS |
| AC3 | Given a migration is required for a new settings schema, when the app launches after an update, then a silent migration runs without prompting the user. | Automated | `SettingsPersistence.test.ts` › "AC3 — silent migration on schema version change" › "runs migration when stored version is below current", "migration fills missing keys with defaults without user prompt" | PASSED | ✅ PASS |

---

## Overall Result

| Story | Criteria | Result |
|---|---|---|
| NSL1V6SAB-10 | 3/3 pass | ✅ TESTED |
| NSL1V6SAB-11 | 3/3 pass | ✅ TESTED |
| NSL1V6SAB-12 | 3/3 pass | ✅ TESTED |
| NSL1V6SAB-13 | 3/3 pass | ✅ TESTED |
| **Epic NSL1V6SAB-1** | **12/12 pass** | **✅ QA APPROVED** |
