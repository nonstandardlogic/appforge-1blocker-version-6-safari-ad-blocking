# 1Blocker v6 — Safari Ad Blocking & Privacy Protection

A React Native (iOS-primary) app rebuilt from the ground up as **1Blocker Version 6**. It ships a Safari Content Blocker extension, a system-wide VPN-based firewall, in-app ad blocking beyond Safari, granular filter controls, and a freemium subscription model.

## Quick links

| Resource | URL |
|---|---|
| Jira Delivery Board | https://nonstandardlogic.atlassian.net/jira/software/projects/NSL1V6SAB/boards |
| Source Idea (AFI-17) | https://nonstandardlogic.atlassian.net/browse/AFI-17 |
| Architecture Docs | [docs/architecture.md](docs/architecture.md) |
| Tech Stack Rationale | [docs/tech-stack.md](docs/tech-stack.md) |
| Feature → Story Map | [docs/features.md](docs/features.md) |
| Architecture Diagram | [docs/architecture-diagram.mmd](docs/architecture-diagram.mmd) |

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20 LTS |
| React Native CLI | 0.73+ |
| Xcode | 15+ |
| CocoaPods | 1.14+ |
| Ruby | 3.2+ (for Fastlane) |
| Android Studio | Giraffe+ |
| JDK | 17 |

## Setup

```bash
# 1. Install JS dependencies
npm install

# 2. Install iOS native dependencies
cd ios && pod install && cd ..

# 3. Copy environment config
cp .env.example .env
# Fill in REVENUECAT_API_KEY, SENTRY_DSN, FILTER_API_BASE_URL, etc.

# 4. Run on iOS simulator
npx react-native run-ios

# 5. Run on Android emulator
npx react-native run-android
```

## Environment variables

| Variable | Purpose |
|---|---|
| `REVENUECAT_API_KEY` | RevenueCat StoreKit integration |
| `FILTER_API_BASE_URL` | Filter rule distribution API |
| `SENTRY_DSN` | Crash reporting |
| `MIXPANEL_TOKEN` | Analytics |
| `FIREBASE_APP_ID` | Push notifications |

## Running tests

```bash
npm test               # Jest unit + snapshot tests
npm run lint           # ESLint
npm run typecheck      # TypeScript type-check
```

## CI/CD

GitHub Actions runs on every push and pull request. See [.github/workflows/ci.yml](.github/workflows/ci.yml). iOS TestFlight and Android internal track releases are handled by Fastlane (configuration in `fastlane/`).

## Monetization tiers

| Tier | Price | Features |
|---|---|---|
| Free | $0 | Basic Safari ad & tracker blocking |
| Monthly | $1.25 – $2.99/mo | Custom rules, in-app blocking, firewall, stats |
| Annual | $12 – $24/yr | Same as monthly, discounted |
| Lifetime | $39.99 one-time | All features, no expiry |

## Architecture overview

See [docs/architecture.md](docs/architecture.md) for the full narrative and [docs/architecture-diagram.mmd](docs/architecture-diagram.mmd) for the Mermaid diagram.
