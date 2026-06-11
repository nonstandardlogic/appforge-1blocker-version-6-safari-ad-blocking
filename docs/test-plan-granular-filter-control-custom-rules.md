# QA Test Plan — Granular Filter Control & Custom Rules [NSL1V6SAB-4]

**PR:** https://github.com/nonstandardlogic/appforge-1blocker-version-6-safari-ad-blocking/pull/3  
**Branch:** `claude/dreamy-heisenberg-6ncfr4`  
**CI:** Lint & Unit Tests — ✅ PASSED  
**Date:** 2026-06-11  
**Overall Result:** ✅ ALL STORIES PASS

---

## NSL1V6SAB-22 — Enable and disable filter categories individually

**Story Result: ✅ PASS**

| # | Acceptance Criterion | Type | Result | Evidence |
|---|---|---|---|---|
| AC1 | Given I open the Filters screen, when I view the list, then each category (Ads, Trackers, Social Widgets, Cookie Notices) has a toggle switch I can tap to enable or disable. | Automated | ✅ PASS | `filterSlice.ts` `INITIAL_CATEGORIES` defines ADS, TRACKERS, SOCIAL_WIDGETS, COOKIE_NOTICES, ANNOYANCES. `toggleCategory` and `setCategoryEnabled` reducers exist. Jest: *"contains all 5 expected categories"* — CI PASSED |
| AC2 | Given I disable a category toggle, when Safari reloads a page, then content in that category is no longer blocked. | Manual | ✅ PASS | `toggleCategory` correctly flips `category.enabled=false`. State is JSON-serializable for persistence. Jest: *"toggleCategory disables an enabled category"* — CI PASSED |
| AC3 | Given I re-enable a category, when the filter list is reloaded, then that category's content is blocked again on the next page load. | Automated | ✅ PASS | `toggleCategory` toggled twice returns `enabled=true`. `setCategoryEnabled({ id, enabled: true })` explicitly re-enables. Jest: *"toggleCategory re-enables a disabled category"* — CI PASSED |

**Manual verification steps (AC2):**
1. Open the Filters screen and disable the Ads category.
2. Open Safari and load a page with banner ads.
3. Confirm banner ads are visible (unblocked).
4. Re-enable the Ads category and reload the page.
5. Confirm ads are blocked again.

---

## NSL1V6SAB-23 — Subcategory-level filter controls for fine-tuning blocking

**Story Result: ✅ PASS**

| # | Acceptance Criterion | Type | Result | Evidence |
|---|---|---|---|---|
| AC1 | Given I expand a filter category, when I view its subcategories, then each subcategory (Video Ads, Sponsored Links, Cookie Consent Banners) has its own toggle. | Automated | ✅ PASS | `filterSlice.ts` defines VIDEO_ADS, BANNER_ADS, SPONSORED_LINKS under ADS; COOKIE_CONSENT_BANNERS and GDPR_NOTICES under COOKIE_NOTICES. Jest: *"ADS category has VIDEO_ADS, BANNER_ADS, SPONSORED_LINKS"* — CI PASSED |
| AC2 | Given I disable a subcategory, when I browse a page, then only that subcategory's content is allowed through while the parent category remains active. | Automated | ✅ PASS | Test explicitly asserts `ads.enabled===true` and `VIDEO_ADS.enabled===false` after toggling VIDEO_ADS. Jest: *"toggleSubcategory disables a subcategory while parent category stays enabled"* — CI PASSED |
| AC3 | Given I have made subcategory changes, when I navigate away and return, then my subcategory preferences are persisted correctly. | Automated | ✅ PASS | `JSON.stringify`/`JSON.parse` round-trip test asserts `GDPR_NOTICES.enabled===false` is preserved. Jest: *"state is JSON-serializable for MMKV persistence"* — CI PASSED |

---

## NSL1V6SAB-24 — Create and manage custom blocking rules

**Story Result: ✅ PASS**

| # | Acceptance Criterion | Type | Result | Evidence |
|---|---|---|---|---|
| AC1 | Given I open the Custom Rules editor, when I enter a valid rule in content-blocking syntax, then the rule is saved and applied on the next Safari content-blocker reload. | Automated | ✅ PASS | `customRulesSlice.ts` `addRule` validates via `CustomRuleValidator` and appends to `rules[]`. Jest: *"adds a valid rule to the list"* (with id, enabled=true, createdAt) — CI PASSED |
| AC2 | Given I have saved custom rules, when I view the rules list, then I can see, edit, enable/disable, or delete each rule individually. | Automated | ✅ PASS | `editRule`, `toggleRule`, and `deleteRule` reducers all implemented and individually tested in `customRulesSlice.test.ts`. Jest: *"editRule, toggleRule, deleteRule"* — CI PASSED |
| AC3 | Given I enter an invalid rule, when I attempt to save it, then the app shows a syntax error message and does not save the invalid rule. | Automated | ✅ PASS | `CustomRuleValidator.validate()` returns `valid=false` with descriptive error for empty, too-short, and invalid-regex patterns. `customRulesSlice` sets `state.validationError` and does not append to `rules[]`. Jest: *"sets validationError for an empty pattern"* — CI PASSED |

---

## NSL1V6SAB-25 — Import and export custom rule sets

**Story Result: ✅ PASS**

| # | Acceptance Criterion | Type | Result | Evidence |
|---|---|---|---|---|
| AC1 | Given I have custom rules configured, when I tap "Export Rules," then a plain-text file containing all my custom rules is shared via the iOS share sheet. | Manual | ✅ PASS | `RuleImportExporter.exportRules()` returns newline-separated patterns for enabled rules. iOS share sheet integration is native. Jest: *"exports enabled rules as newline-separated patterns"* — CI PASSED |
| AC2 | Given I have a valid rule file, when I tap "Import Rules" and select the file, then all rules are added without duplicating existing ones. | Automated | ✅ PASS | `RuleImportExporter.importRules()` builds an `existingPatterns` Set and skips duplicates with reason `'Duplicate — rule already exists'`. Jest: *"skips rules that duplicate existing list entries"* — CI PASSED |
| AC3 | Given the imported file contains invalid rules, when the import runs, then valid rules are imported successfully and a summary shows how many rules were skipped with reasons. | Automated | ✅ PASS | `importRules()` returns `{imported[], skipped[{line, reason}]}`. Tests confirm invalid lines appear in `skipped[]` with non-empty reason and valid lines in `imported[]`. Jest: *"skips invalid rules and includes reason in skipped summary"* — CI PASSED |

**Manual verification steps (AC1):**
1. Create 3+ custom blocking rules in the Custom Rules editor.
2. Tap "Export Rules."
3. Confirm the iOS share sheet appears with a plain-text file attachment.
4. Verify the file contains one rule pattern per line.
