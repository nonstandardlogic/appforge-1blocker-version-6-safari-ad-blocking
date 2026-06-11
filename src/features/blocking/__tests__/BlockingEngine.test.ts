import { BlockingEngine } from '../BlockingEngine';

describe('BlockingEngine', () => {
  let engine: BlockingEngine;

  beforeEach(() => {
    engine = new BlockingEngine();
  });

  describe('AC1: automatic ad blocking — banner, pre-roll, interstitial', () => {
    it('blocks Google DoubleClick display ads', () => {
      expect(
        engine.isAdNetworkBlocked(
          'https://ad.doubleclick.net/ddm/pfadx/N8621.134425/B21848597.235197924',
        ),
      ).toBe(true);
    });

    it('blocks Google AdSense banner ads', () => {
      expect(
        engine.isAdNetworkBlocked(
          'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        ),
      ).toBe(true);
    });

    it('blocks Google AdServices', () => {
      expect(
        engine.isAdNetworkBlocked('https://www.googleadservices.com/pagead/aclk'),
      ).toBe(true);
    });

    it('blocks YouTube pre-roll ad requests', () => {
      expect(
        engine.isAdNetworkBlocked('https://www.youtube.com/pagead/adview?ai=D'),
      ).toBe(true);
    });

    it('blocks Amazon display and interstitial ads', () => {
      expect(
        engine.isAdNetworkBlocked(
          'https://aax-us-east.amazon-adsystem.com/e/xsp/fetchAd',
        ),
      ).toBe(true);
    });

    it('blocks Outbrain content-recommendation ads', () => {
      expect(
        engine.isAdNetworkBlocked('https://widgets.outbrain.com/outbrain.js'),
      ).toBe(true);
    });

    it('blocks Taboola sponsored-content ads', () => {
      expect(
        engine.isAdNetworkBlocked('https://cdn.taboola.com/libtrc/nyt/loader.js'),
      ).toBe(true);
    });

    it('does not block legitimate editorial content URLs', () => {
      expect(engine.isAdNetworkBlocked('https://www.nytimes.com/article/news')).toBe(false);
      expect(engine.isAdNetworkBlocked('https://www.bbc.com/news/world')).toBe(false);
    });
  });

  describe('AC2: ad slot collapse — no blank white spaces (cosmetic rules)', () => {
    it('has at least one cosmetic css-display-none rule', () => {
      expect(engine.hasCosmeticRules()).toBe(true);
    });

    it('cosmetic rules target ins.adsbygoogle (Google banner slots)', () => {
      const hasSelector = engine
        .getCosmeticRules()
        .some(
          r =>
            r.action.type === 'css-display-none' &&
            r.action.selector?.includes('adsbygoogle'),
        );
      expect(hasSelector).toBe(true);
    });

    it('cosmetic rules collapse .ad-slot and .ad-container elements', () => {
      const hasSelector = engine
        .getCosmeticRules()
        .some(
          r =>
            r.action.type === 'css-display-none' &&
            r.action.selector?.includes('ad-slot'),
        );
      expect(hasSelector).toBe(true);
    });

    it('cosmetic rules hide sponsored-content and promoted-content widgets', () => {
      const hasSelector = engine
        .getCosmeticRules()
        .some(
          r =>
            r.action.type === 'css-display-none' &&
            r.action.selector?.includes('sponsored-content'),
        );
      expect(hasSelector).toBe(true);
    });
  });

  describe('AC3: comprehensive tracker coverage for AdBlock Tester passing score', () => {
    it('blocks Google Analytics (tracker)', () => {
      expect(
        engine.isTrackerBlocked('https://www.google-analytics.com/analytics.js'),
      ).toBe(true);
    });

    it('blocks Facebook Pixel (tracker)', () => {
      expect(
        engine.isTrackerBlocked(
          'https://www.facebook.com/tr?id=12345&ev=PageView',
        ),
      ).toBe(true);
    });

    it('blocks Twitter Ads pixel (tracker)', () => {
      expect(
        engine.isTrackerBlocked('https://ads.twitter.com/i/adsct'),
      ).toBe(true);
    });

    it('compiled rule set contains both block and css-display-none rules', async () => {
      const rules = await engine.compileRules();
      expect(rules.length).toBeGreaterThan(0);

      const blockRules = rules.filter(r => r.action.type === 'block');
      const cosmeticRules = rules.filter(r => r.action.type === 'css-display-none');

      expect(blockRules.length).toBeGreaterThan(0);
      expect(cosmeticRules.length).toBeGreaterThan(0);
    });

    it('all rule url-filter patterns are valid regular expressions', async () => {
      const rules = await engine.compileRules();
      rules.forEach(rule => {
        expect(() => new RegExp(rule.trigger['url-filter'])).not.toThrow();
      });
    });
  });
});
