import type { BlockingRule } from './types';

// Major ad-network rules: banner, video pre-roll, interstitial (AC1)
const AD_NETWORK_RULES: BlockingRule[] = [
  { trigger: { 'url-filter': '.*\\.doubleclick\\.net' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*googlesyndication\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.googleadservices\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.google-analytics\\.com' }, action: { type: 'block' } },
  {
    trigger: { 'url-filter': '.*\\.facebook\\.com/tr', 'resource-type': ['image', 'fetch'] },
    action: { type: 'block' },
  },
  { trigger: { 'url-filter': '.*\\.amazon-adsystem\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.outbrain\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.taboola\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.youtube\\.com/pagead' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.2mdn\\.net' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*/ads\\.js' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*/advert(ising)?/' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*adserv(er|ice)' }, action: { type: 'block' } },
];

// Cross-site tracker rules covering Cover Your Tracks top trackers (AC1)
const TRACKER_RULES: BlockingRule[] = [
  { trigger: { 'url-filter': '.*google-analytics\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*googletagmanager\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.facebook\\.com/tr\\?' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*connect\\.facebook\\.net' }, action: { type: 'block' } },
  { trigger: { 'url-filter': 'https?://ads\\.twitter\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*snap\\.licdn\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.linkedin\\.com/px' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*ct\\.pinterest\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*sc-static\\.net/scevent' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*analytics\\.tiktok\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.clarity\\.ms' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*bat\\.bing\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.omtrdc\\.net' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*api\\.segment\\.io' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*cdn\\.segment\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*api2\\.amplitude\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.hotjar\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*\\.criteo\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*static\\.chartbeat\\.com' }, action: { type: 'block' } },
  { trigger: { 'url-filter': '.*api\\.mixpanel\\.com' }, action: { type: 'block' } },
];

// Cosmetic rules: collapse empty ad slots so no blank white spaces remain (AC2)
const COSMETIC_RULES: BlockingRule[] = [
  {
    trigger: { 'url-filter': '.*' },
    action: {
      type: 'css-display-none',
      selector:
        '.ad-slot, .ad-container, .advertisement, [id^="ad-"], [class*="ad-unit"], [class*="advert"], ins.adsbygoogle',
    },
  },
  {
    trigger: { 'url-filter': '.*' },
    action: {
      type: 'css-display-none',
      selector:
        '[class*="sponsored-content"], [class*="promoted-content"], .outbrain-widget, .taboola-widget',
    },
  },
];

export class BlockingEngine {
  private readonly adRules: BlockingRule[] = AD_NETWORK_RULES;
  private readonly trackerRules: BlockingRule[] = TRACKER_RULES;
  private readonly cosmeticRules: BlockingRule[] = COSMETIC_RULES;

  async compileRules(): Promise<BlockingRule[]> {
    return [...this.adRules, ...this.trackerRules, ...this.cosmeticRules];
  }

  getAdRules(): BlockingRule[] {
    return this.adRules;
  }

  getTrackerRules(): BlockingRule[] {
    return this.trackerRules;
  }

  getCosmeticRules(): BlockingRule[] {
    return this.cosmeticRules;
  }

  isAdNetworkBlocked(url: string): boolean {
    return this.adRules.some(rule => {
      try {
        return new RegExp(rule.trigger['url-filter'], 'i').test(url);
      } catch {
        return false;
      }
    });
  }

  isTrackerBlocked(url: string): boolean {
    return this.trackerRules.some(rule => {
      try {
        return new RegExp(rule.trigger['url-filter'], 'i').test(url);
      } catch {
        return false;
      }
    });
  }

  hasCosmeticRules(): boolean {
    return this.cosmeticRules.length > 0;
  }

  extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }
}
