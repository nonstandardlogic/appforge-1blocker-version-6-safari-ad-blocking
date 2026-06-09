# Feature List — 1Blocker v6

Each feature is cross-referenced to its Jira Story ID in project **NSL1V6SAB**.

---

## Epic 1 — Core Onboarding & Safari Extension Setup (NSL1V6SAB-1)

| # | Feature | Jira Story | Priority |
|---|---|---|---|
| 1.1 | Multi-step guided setup wizard to enable the Safari Content Blocker extension | [NSL1V6SAB-9](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-9) | P0 |
| 1.2 | Post-setup blocking dashboard showing live blocked-ads counter from zero | [NSL1V6SAB-10](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-10) | P0 |
| 1.3 | In-app permission status check and one-tap "Fix it" repair flow | [NSL1V6SAB-11](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-11) | P0 |
| 1.4 | Allow-list (whitelist) trusted sites from the Safari Share Extension | [NSL1V6SAB-12](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-12) | P1 |
| 1.5 | Settings and allowlists persisted across app updates via iCloud KV | [NSL1V6SAB-13](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-13) | P1 |

---

## Epic 2 — Ad & Tracker Blocking Engine (NSL1V6SAB-2)

| # | Feature | Jira Story | Priority |
|---|---|---|---|
| 2.1 | Zero-config automatic ad blocking in Safari (banner, pre-roll, interstitial) | [NSL1V6SAB-14](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-14) | P0 |
| 2.2 | Cross-site tracker prevention blocking Google Analytics, Facebook Pixel, etc. | [NSL1V6SAB-15](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-15) | P0 |
| 2.3 | Automatic background filter list refresh (Wi-Fi or metered preference) | [NSL1V6SAB-16](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-16) | P0 |
| 2.4 | "Report broken site" share extension with one-tap false-positive submission | [NSL1V6SAB-17](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-17) | P1 |

---

## Epic 3 — Freemium Monetization & Subscription Management (NSL1V6SAB-3)

| # | Feature | Jira Story | Priority |
|---|---|---|---|
| 3.1 | Free tier with basic Safari ad/tracker blocking, no paywall | [NSL1V6SAB-18](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-18) | P0 |
| 3.2 | In-app subscription purchase ($1.25–$2.99/mo, monthly & annual) via Face ID / Apple Pay | [NSL1V6SAB-19](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-19) | P0 |
| 3.3 | One-time lifetime premium license ($39.99) | [NSL1V6SAB-20](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-20) | P1 |
| 3.4 | Restore existing purchase (StoreKit 2) on new or restored device | [NSL1V6SAB-21](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-21) | P0 |

---

## Epic 4 — Granular Filter Control & Custom Rules (NSL1V6SAB-4)

| # | Feature | Jira Story | Priority |
|---|---|---|---|
| 4.1 | Per-category filter toggles (Ads, Trackers, Social Widgets, Cookie Notices) | [NSL1V6SAB-22](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-22) | P1 |
| 4.2 | Subcategory-level filter controls (e.g., Video Ads, Sponsored Links) | [NSL1V6SAB-23](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-23) | P1 |
| 4.3 | Custom rule editor with content-blocking syntax validation | [NSL1V6SAB-24](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-24) | P1 |
| 4.4 | Import / export custom rule sets via iOS Share Sheet | [NSL1V6SAB-25](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-25) | P2 |

---

## Epic 5 — In-App Ad Blocking Beyond Safari (NSL1V6SAB-5)

| # | Feature | Jira Story | Priority |
|---|---|---|---|
| 5.1 | System-wide in-app ad blocking for third-party iOS apps | [NSL1V6SAB-26](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-26) | P1 |
| 5.2 | Per-app exclusion list to bypass in-app blocking | [NSL1V6SAB-27](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-27) | P1 |
| 5.3 | Per-app blocking statistics with day/week/month chart | [NSL1V6SAB-28](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-28) | P2 |

---

## Epic 6 — System-Wide Firewall & Network Protection (NSL1V6SAB-6)

| # | Feature | Jira Story | Priority |
|---|---|---|---|
| 6.1 | System-wide VPN-based DNS firewall (NEPacketTunnelProvider) | [NSL1V6SAB-29](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-29) | P1 |
| 6.2 | Block specific domains or CIDR IP ranges via firewall rules | [NSL1V6SAB-30](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-30) | P1 |
| 6.3 | Real-time firewall activity log with filter and block/allow detail | [NSL1V6SAB-31](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-31) | P2 |
| 6.4 | Per-app firewall allowlists for trusted applications | [NSL1V6SAB-32](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-32) | P2 |

---

## Epic 7 — Filter Update Infrastructure & Performance (NSL1V6SAB-7)

| # | Feature | Jira Story | Priority |
|---|---|---|---|
| 7.1 | ≥20% page load improvement with blocking active; <50ms extension overhead | [NSL1V6SAB-33](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-33) | P0 |
| 7.2 | Cloudflare CDN filter distribution with delta diffs and hash validation | [NSL1V6SAB-34](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-34) | P0 |
| 7.3 | <2% battery / <15 MB extension memory / <5s CPU per background update | [NSL1V6SAB-35](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-35) | P1 |

---

## Epic 8 — App Polish, Accessibility & Home Screen Integration (NSL1V6SAB-8)

| # | Feature | Jira Story | Priority |
|---|---|---|---|
| 8.1 | Full dark mode support matching iOS system theme (live switching) | [NSL1V6SAB-36](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-36) | P1 |
| 8.2 | WidgetKit home-screen widget (small / medium / large) with live blocking stats | [NSL1V6SAB-37](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-37) | P1 |
| 8.3 | Dynamic Type support — all text scales; ≥44pt touch targets; VoiceOver labels | [NSL1V6SAB-38](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-38) | P1 |
| 8.4 | Exportable PDF privacy report with date-range filter and share sheet | [NSL1V6SAB-39](https://nonstandardlogic.atlassian.net/browse/NSL1V6SAB-39) | P2 |
