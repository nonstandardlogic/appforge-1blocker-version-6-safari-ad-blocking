# Architecture — 1Blocker v6

## System overview

1Blocker v6 is a privacy-focused iOS application built with **React Native 0.73** (bare workflow). The product has three runtime boundaries that are architecturally distinct:

1. **Main React Native app** — settings, dashboard, statistics, paywall, filter management UI.
2. **Safari Content Blocker extension** — a native iOS App Extension that delivers a compiled JSON rule set to Safari. Runs in Safari's process, isolated from the main app. Written in Swift.
3. **Network Extension (VPN-based firewall)** — a native iOS `NEPacketTunnelProvider` that performs DNS-based filtering for system-wide ad and tracker blocking. Written in Swift.

A fourth optional boundary — the **WidgetKit extension** — provides home-screen widgets backed by a shared App Group data store.

The backend is a lightweight **Node.js / Fastify** service deployed on **Railway** (or any container host). Its primary job is filter rule distribution; it is not in the critical path for blocking, which is fully on-device.

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile framework | React Native 0.73 (bare) | Bare workflow required for native extensions |
| Language (JS) | TypeScript 5.x | Strict mode |
| Language (iOS extensions) | Swift 5.9 | ContentBlocker, NetworkExtension, Widget |
| Navigation | React Navigation 6 (Stack + Bottom Tabs) | De-facto standard |
| State management | Redux Toolkit + RTK Query | Predictable state, built-in data fetching |
| Local storage (KV) | MMKV (`react-native-mmkv`) | 10× faster than AsyncStorage |
| Local storage (relational) | WatermelonDB (SQLite) | Blocking logs, per-app statistics |
| In-app purchases | RevenueCat (`react-native-purchases`) | Abstracts StoreKit 2 + Google Play Billing |
| Analytics | Mixpanel | Event-level user analytics |
| Crash reporting | Sentry (`@sentry/react-native`) | Source-map support |
| Push notifications | Firebase Cloud Messaging + APNs | Filter-update nudges, feature announcements |
| Background tasks | `react-native-background-fetch` | Filter list refresh |
| iOS Share Extension | Native Swift | "Report broken site" + "Allow this site" |
| CI/CD | GitHub Actions + Fastlane | ESLint, Jest, Gradle, TestFlight |
| Filter CDN | Cloudflare R2 + Workers | Delta diff delivery |
| Backend | Node.js 20 / Fastify on Railway | Filter publishing, false-positive ingestion |
| Database (backend) | PostgreSQL 16 (Railway managed) | Filter metadata, report queue |

---

## Folder structure

```
appforge-1blocker-version-6-safari-ad-blocking/
├── src/
│   ├── features/
│   │   ├── onboarding/          # NSL1V6SAB-1 (Stories -9 to -13)
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   └── onboardingSlice.ts
│   │   ├── blocking/            # NSL1V6SAB-2 (Stories -14 to -17)
│   │   │   ├── screens/
│   │   │   ├── hooks/
│   │   │   └── blockingSlice.ts
│   │   ├── subscription/        # NSL1V6SAB-3 (Stories -18 to -21)
│   │   │   ├── screens/
│   │   │   ├── Paywall.tsx
│   │   │   └── subscriptionSlice.ts
│   │   ├── filters/             # NSL1V6SAB-4 (Stories -22 to -25)
│   │   │   ├── screens/
│   │   │   ├── CustomRuleEditor.tsx
│   │   │   └── filtersSlice.ts
│   │   ├── inAppBlocking/       # NSL1V6SAB-5 (Stories -26 to -28)
│   │   │   ├── screens/
│   │   │   └── inAppBlockingSlice.ts
│   │   ├── firewall/            # NSL1V6SAB-6 (Stories -29 to -32)
│   │   │   ├── screens/
│   │   │   ├── ActivityLog.tsx
│   │   │   └── firewallSlice.ts
│   │   ├── statistics/          # NSL1V6SAB-7, NSL1V6SAB-8 (Stories -33 to -39)
│   │   │   ├── screens/
│   │   │   └── statsSlice.ts
│   │   └── settings/
│   │       ├── screens/
│   │       └── settingsSlice.ts
│   ├── shared/
│   │   ├── components/          # Button, Card, Toggle, Badge, etc.
│   │   ├── hooks/               # useBlockingStatus, useSubscription, etc.
│   │   ├── store/               # Redux store configuration
│   │   ├── api/                 # RTK Query endpoints
│   │   ├── navigation/          # Route definitions, deep links
│   │   ├── theme/               # Colors, typography, spacing
│   │   └── utils/              # formatters, validators, constants
│   └── native/
│       └── modules/             # Native module bridges
├── ios/
│   ├── OneblockerApp/           # Main iOS app target
│   ├── ContentBlockerExtension/ # Safari Content Blocker (Swift)
│   ├── NetworkExtension/        # VPN firewall (NEPacketTunnelProvider, Swift)
│   ├── ShareExtension/          # "Allow site" / "Report" share extension
│   └── OneblockerWidget/        # WidgetKit extension (Swift)
├── android/
│   └── app/                     # Android app (DNS-based filtering where possible)
├── backend/
│   ├── src/
│   │   ├── routes/              # /filters, /reports, /updates
│   │   └── workers/             # Filter publish pipeline
│   └── Dockerfile
├── fastlane/
│   ├── Fastfile
│   └── Appfile
├── docs/
├── .github/workflows/
└── package.json
```

---

## Data model

### FilterList
```
id           UUID    PK
name         String  e.g. "EasyList", "uBlock Filters"
sourceUrl    String  canonical upstream URL
cdnUrl       String  Cloudflare R2 object URL (compiled JSON)
version      String  semantic version or hash
lastUpdated  Date
category     Enum    ADS | TRACKERS | ANNOYANCES | SOCIAL | PRIVACY | CUSTOM
enabled      Boolean
isBuiltIn    Boolean
```

### BlockingRule (custom rules store)
```
id           UUID    PK
trigger      JSON    {url-filter, resource-type[], if-domain[], unless-domain[]}
action       JSON    {type: "block" | "css-display-none" | "ignore-previous-rules"}
enabled      Boolean
listId       UUID?   FK → FilterList (null = user custom)
createdAt    Date
```

### AllowlistEntry
```
id           UUID    PK
domain       String  e.g. "example.com"
addedAt      Date
source       Enum    USER | SHARE_EXTENSION
```

### FirewallRule
```
id           UUID    PK
type         Enum    DOMAIN | CIDR | APP_ALLOWLIST
pattern      String  domain glob or CIDR notation
action       Enum    BLOCK | ALLOW
priority     Int     lower = higher priority
enabled      Boolean
createdAt    Date
```

### NetworkEvent (SQLite, rolling 30-day window)
```
id           INTEGER PK AUTOINCREMENT
timestamp    Date
domain       String
bundleId     String?  originating app bundle ID
action       Enum     BLOCKED | ALLOWED
protocol     Enum     DNS | HTTPS | HTTP
ruleId       UUID?    matched FirewallRule
```

### BlockingStats (SQLite daily roll-up)
```
date         Date    PK
totalBlocked Integer
byCategory   JSON    {ads: N, trackers: N, annoyances: N, social: N}
byApp        JSON    {bundleId: count, ...}
```

### UserSubscription (MMKV + RevenueCat entitlements)
```
tier         Enum    FREE | MONTHLY | ANNUAL | LIFETIME
expiresAt    Date?
isLifetime   Boolean
purchaseType Enum    APP_STORE | RESTORED
```

### AppSettings (MMKV)
```
filterUpdateFrequency  Enum    DAILY | WEEKLY | MANUAL
wifiOnlyUpdates        Boolean
enableDarkMode         Enum    SYSTEM | LIGHT | DARK
notificationsEnabled   Boolean
iCloudSyncEnabled      Boolean
lastFilterUpdateCheck  Date
```

---

## API design

All endpoints are prefixed `/api/v1`. The client authenticates with a short-lived JWT (derived from the device's anonymous ID). No user accounts are required.

### Filter distribution

| Method | Path | Description |
|---|---|---|
| `GET` | `/filters/catalog` | Returns all available filter lists with version and category metadata |
| `GET` | `/filters/:id/meta` | Current version hash and CDN URL for a single list |
| `GET` | `/filters/:id/rules` | Full compiled JSON rule set (redirects to Cloudflare R2) |
| `GET` | `/filters/:id/delta?from=<hash>` | Delta diff from a known version hash |
| `GET` | `/filters/updates/check` | Batch check: `{listId: currentHash}` → returns only stale lists |

### Reporting

| Method | Path | Description |
|---|---|---|
| `POST` | `/reports/false-positive` | `{domain, activeRuleIds[], appVersion, osVersion}` |
| `POST` | `/reports/broken-site` | Alias for false-positive, source = share extension |

### Analytics (internal, batched)

| Method | Path | Description |
|---|---|---|
| `POST` | `/analytics/events` | Batched event array (non-PII, hashed device ID) |

---

## Third-party integrations

| Integration | Purpose | Library / Provider |
|---|---|---|
| **RevenueCat** | StoreKit 2 entitlement management, paywall A/B testing, purchase restoration | `react-native-purchases` |
| **Cloudflare R2 + Workers** | Filter rule CDN with delta diff support; handles update spikes (NSL1V6SAB-34) | Cloudflare SDK (server-side) |
| **Sentry** | Crash reporting, performance traces, extension crash attribution | `@sentry/react-native` |
| **Mixpanel** | Feature adoption analytics, funnel analysis (free→paid conversion) | `mixpanel-react-native` |
| **Firebase FCM + APNs** | Push notifications for filter update availability, onboarding nudges | `@react-native-firebase/messaging` |
| **WidgetKit** (native) | Home-screen blocking stats widget in small/medium/large sizes (NSL1V6SAB-37) | Swift WidgetKit |
| **NetworkExtension** (native) | VPN-based DNS firewall for system-wide blocking (NSL1V6SAB-29 to -32) | Swift NEPacketTunnelProvider |
| **StoreKit 2** (native, via RevenueCat) | In-app purchases: subscriptions + lifetime (NSL1V6SAB-19, -20, -21) | RevenueCat |
| **iCloud Key-Value Store** | Settings and allowlist sync across user devices (NSL1V6SAB-13) | Native iOS `NSUbiquitousKeyValueStore` |
| **Background App Refresh** | Silent filter list updates (NSL1V6SAB-16) | `react-native-background-fetch` |
| **Share Extension** (native) | "Allow this site" and "Report broken site" from Safari (NSL1V6SAB-12, -17) | Swift UIViewController |

---

## Security considerations

### Authentication & authorization
- No user accounts. Entitlements are managed entirely through StoreKit 2 via RevenueCat.
- API calls use a device-anonymous JWT (UUID hashed with a server secret). No PII transmitted.
- The backend never receives Apple ID or payment data — RevenueCat handles all receipt validation.

### Data storage
- `MMKV`: Settings and subscription state — stored in the iOS Keychain for the subscription entitlement flag; other settings in MMKV which is encrypted at rest via iOS Data Protection (class `FileProtectionCompleteUntilFirstUserAuthentication`).
- `WatermelonDB (SQLite)`: Blocking logs stored locally only, not synced to any server. Rolling 30-day window enforced via background cleanup task.
- `iCloud KV Store`: Only non-sensitive user preferences and allowlist domains are synced. No browsing history or logs leave the device.

### Extension isolation
- The Safari Content Blocker extension operates in Safari's sandboxed process and has no network access — it only receives the compiled rule JSON via the `SFContentBlockerManager` API.
- The Network Extension runs as a separate process with its own entitlements and cannot access main app memory.

### PII handling
- Analytics events include only hashed device ID, event name, and non-identifiable metadata (iOS version, app version, subscription tier).
- False-positive reports include only the domain name and active rule IDs — no URLs, page content, or user identity.
- The privacy policy must clearly state that no browsing history is collected or transmitted.

### Network security
- All API calls use TLS 1.3 with certificate pinning (`TrustKit`).
- Filter CDN downloads are verified via SHA-256 checksum before being applied (NSL1V6SAB-34 acceptance criterion).

---

## Scalability notes

### Expected load
- Target: 500K MAU at launch (based on existing 100K+ App Store reviews).
- Filter update spike: ~100K devices checking for updates within 1 hour of a new App Store release.
- Average API call volume: ~3 API calls/device/day (update check + false-positive reports).

### Scaling strategy
- **Filter distribution**: Cloudflare R2 + Workers handles the CDN layer. The origin server (Railway) only writes new filter versions; reads are served entirely from the CDN edge. Delta diffs minimize payload size and CDN egress costs.
- **Backend**: Fastify on Railway with horizontal auto-scaling. The stateless API tier scales independently from the PostgreSQL database.
- **Database**: PostgreSQL with read replicas for the filter catalog. False-positive reports are written to a queue (Redis/BullMQ) and processed asynchronously.
- **On-device**: All blocking decisions are made on-device with no network round-trip, ensuring zero latency degradation and full offline functionality.

---

## Implementation order

Recommended delivery sequence aligned with Epic priority:

| Phase | Epic | Jira Key | Rationale |
|---|---|---|---|
| 1 | Core Onboarding & Safari Extension Setup | NSL1V6SAB-1 | First-run experience; gates all value delivery |
| 2 | Ad & Tracker Blocking Engine | NSL1V6SAB-2 | Core product value proposition |
| 3 | Freemium Monetization & Subscription Management | NSL1V6SAB-3 | Enables revenue from launch day |
| 4 | Granular Filter Control & Custom Rules | NSL1V6SAB-4 | Key differentiator vs Wipr 2 and AdGuard |
| 5 | Filter Update Infrastructure & Performance | NSL1V6SAB-7 | Backend must be stable before in-app blocking |
| 6 | In-App Ad Blocking Beyond Safari | NSL1V6SAB-5 | Requires Network Extension foundation from Epic 6 |
| 7 | System-Wide Firewall & Network Protection | NSL1V6SAB-6 | Most complex; requires Network Extension entitlements |
| 8 | App Polish, Accessibility & Home Screen Integration | NSL1V6SAB-8 | Final polish, accessibility audit, widgets |
