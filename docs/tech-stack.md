# Tech Stack Rationale — 1Blocker v6

## Mobile framework: React Native 0.73 (bare workflow)

**Why React Native?** The product requires a native-quality iOS experience with deep OS integration. React Native's bare workflow allows us to ship a polished cross-platform codebase while adding native Swift targets for the four iOS extensions (Safari Content Blocker, Network Extension, Share Extension, WidgetKit).

**Why bare, not Expo managed?** The `NetworkExtension` entitlement for the VPN firewall (NSL1V6SAB-29) and the `ContentBlockerExtension` target cannot be managed by Expo's app config alone. Bare gives full control over the `Podfile` and Xcode project.

**Why not Swift/SwiftUI native?** React Native allows faster iteration on settings, filter management, and analytics screens (80% of the UI surface), while the performance-sensitive extension code (100% of blocking logic) remains in Swift.

---

## Navigation: React Navigation 6

The de-facto standard for React Native navigation. Stack + Bottom Tab combination covers the app's navigation patterns (onboarding flow → tabbed main app). Deep-link support is built in and required for the WidgetKit tap target (NSL1V6SAB-37).

**Rejected alternative: Expo Router** — requires Expo managed workflow.

---

## State management: Redux Toolkit + RTK Query

Redux Toolkit provides predictable, inspectable state — important for debugging complex blocking logic and subscription state. RTK Query eliminates boilerplate for server state (filter catalog, update checks) and integrates well with the offline-first requirements.

**Rejected alternative: Zustand** — simpler API but lacks RTK Query's caching and invalidation for the filter update polling pattern.

---

## Local storage

**MMKV** (`react-native-mmkv`): 10× faster than AsyncStorage for frequent reads (subscription entitlement flag checked on every screen mount, settings read on every extension reload).

**WatermelonDB** (SQLite): Chosen for the blocking event log and per-app statistics (NSL1V6SAB-28, NSL1V6SAB-31). WatermelonDB's lazy-loading and batch write API handles the high-frequency write volume from the Network Extension without blocking the React Native JS thread.

**Rejected alternative: Realm** — heavier binary, slower startup on older iPhones.

---

## In-app purchases: RevenueCat (`react-native-purchases`)

RevenueCat abstracts StoreKit 2 (iOS) and Google Play Billing (Android) behind a single SDK. Key benefits for this product:

- **Subscription restoration** (NSL1V6SAB-21) is handled with a single `restorePurchases()` call across both platforms.
- **Paywalls** can be configured remotely without app updates — critical for A/B testing the free→paid conversion funnel.
- **Entitlement verification** happens server-side; the app never does raw receipt parsing.
- **Lifetime purchase** (NSL1V6SAB-20) modelled as a RevenueCat non-consumable product.

**Rejected alternative: raw StoreKit 2 + server-side receipt validation** — significant engineering overhead with no benefit at this scale.

---

## Analytics: Mixpanel

Event-level analytics for funnel analysis (free → monthly → lifetime conversion). Mixpanel's mobile SDK supports offline queuing and automatic flushing, which is important for users with intermittent connectivity.

**Key events to track:** `setup_wizard_started`, `setup_wizard_completed`, `paywall_viewed`, `subscription_purchased`, `filter_category_toggled`, `firewall_enabled`, `false_positive_reported`.

**Rejected alternative: Amplitude** — equivalent capability; Mixpanel chosen for existing org familiarity.

---

## Crash reporting: Sentry (`@sentry/react-native`)

Sentry is chosen because it handles source-map uploads for both the JS bundle and the native Swift crash stacks in a single SDK, giving unified crash attribution across extension boundaries. The Network Extension and Share Extension can be instrumented separately with the same DSN.

---

## Push notifications: Firebase Cloud Messaging + APNs

Firebase handles the Android push path; on iOS FCM proxies to APNs. Use cases: nudge users to open the app when a major filter update is available; re-engagement campaigns for free-tier users. The `@react-native-firebase/messaging` package is the standard integration path for React Native.

---

## Background tasks: `react-native-background-fetch`

Used to schedule the filter list update check (NSL1V6SAB-16). The library wraps `BGAppRefreshTask` on iOS and `WorkManager` on Android with a unified API, supporting the Wi-Fi-only preference via the `requiresNetworkType` option.

---

## Filter CDN: Cloudflare R2 + Workers

**R2** stores the compiled JSON rule sets. Zero egress fees between Cloudflare products.

**Workers** implement the delta-diff endpoint: given a client's current rule hash, the Worker returns only changed rules rather than the full list (NSL1V6SAB-34). This reduces average payload from ~3 MB (full EasyList) to <100 KB per update.

**Hash validation** is performed client-side before applying any update, preventing corrupted CDN files from disabling protection (NSL1V6SAB-34 acceptance criterion).

---

## Backend: Node.js 20 / Fastify on Railway

Fastify's low overhead and schema-based validation suit the lightweight API surface (filter metadata + false-positive reports). Railway provides managed PostgreSQL, zero-downtime deploys, and horizontal auto-scaling without infrastructure configuration.

**PostgreSQL 16** stores filter list metadata (versions, categories, CDN URLs) and the false-positive report queue. The report queue is backed by **BullMQ + Redis** so filter engineers can triage reports asynchronously without blocking API responses.

---

## iOS native extensions (Swift)

| Extension | Entitlement | Purpose |
|---|---|---|
| `ContentBlockerExtension` | `com.apple.developer.web-browser` content blocker | Delivers compiled JSON rules to Safari |
| `NetworkExtension` | `com.apple.developer.networking.networkextension` packet-tunnel-provider | VPN DNS firewall (NSL1V6SAB-29 to -32) |
| `ShareExtension` | None (standard App Extension) | "Allow site" / "Report broken site" from Safari action sheet |
| `OneblockerWidget` | `com.apple.developer.widgetkit` | WidgetKit home-screen stats (NSL1V6SAB-37) |

**Certificate pinning**: `TrustKit` (Swift) pins the filter API certificate to prevent MITM attacks on filter downloads.

---

## CI/CD: GitHub Actions + Fastlane

GitHub Actions runs the PR gate (lint, tests, Android build). Fastlane handles the release pipelines:

- **iOS**: `fastlane beta` → build with Xcode Cloud or self-hosted macOS runner → upload to TestFlight.
- **Android**: `fastlane supply` → AAB upload to Google Play internal track.

Secrets (certificates, API keys) are stored in GitHub Actions encrypted secrets and injected at build time. Never committed to the repository.
