import { BlockingEngine } from '../BlockingEngine';

describe('BlockingEngine – expanded tracker rules (AC1 + Cover Your Tracks)', () => {
  let engine: BlockingEngine;

  beforeEach(() => {
    engine = new BlockingEngine();
  });

  const trackerUrls: [string, string][] = [
    ['Google Analytics', 'https://www.google-analytics.com/analytics.js'],
    ['Google Analytics collect', 'https://www.google-analytics.com/collect'],
    ['Google Tag Manager', 'https://www.googletagmanager.com/gtm.js'],
    ['Facebook Pixel', 'https://www.facebook.com/tr?id=123&ev=PageView'],
    ['Facebook SDK', 'https://connect.facebook.net/en_US/fbevents.js'],
    ['Twitter Ads', 'https://ads.twitter.com/i/adsct'],
    ['LinkedIn Insight', 'https://snap.licdn.com/li.lms-analytics/insight.min.js'],
    ['LinkedIn pixel', 'https://www.linkedin.com/px/li_sync'],
    ['Pinterest Tag', 'https://ct.pinterest.com/v3/?tid=123'],
    ['Snapchat Pixel', 'https://sc-static.net/scevent.min.js'],
    ['TikTok Pixel', 'https://analytics.tiktok.com/i18n/pixel/identify.js'],
    ['Microsoft Clarity', 'https://www.clarity.ms/tag/12345'],
    ['Bing Ads UET', 'https://bat.bing.com/action/0'],
    ['Adobe Analytics', 'https://metrics.company.omtrdc.net/b/ss/report'],
    ['Segment.io API', 'https://api.segment.io/v1/t'],
    ['Segment CDN', 'https://cdn.segment.com/analytics.js/v1/key/analytics.min.js'],
    ['Amplitude', 'https://api2.amplitude.com/2/httpapi'],
    ['Hotjar', 'https://static.hotjar.com/c/hotjar-123.js'],
    ['Criteo', 'https://www.criteo.com/delivery/r/ajs.php'],
    ['Chartbeat', 'https://static.chartbeat.com/js/chartbeat.js'],
    ['Mixpanel', 'https://api.mixpanel.com/track'],
  ];

  it.each(trackerUrls)('blocks %s (%s)', (_label, url) => {
    expect(engine.isTrackerBlocked(url)).toBe(true);
  });

  it('has at least 20 tracker rules', () => {
    expect(engine.getTrackerRules().length).toBeGreaterThanOrEqual(20);
  });

  it('does not false-positive on a legitimate URL', () => {
    expect(engine.isTrackerBlocked('https://www.bbc.com/news/article')).toBe(false);
    expect(engine.isTrackerBlocked('https://github.com/user/repo')).toBe(false);
  });
});

describe('BlockingEngine – extractDomain()', () => {
  let engine: BlockingEngine;

  beforeEach(() => {
    engine = new BlockingEngine();
  });

  it('extracts hostname from a full URL', () => {
    expect(engine.extractDomain('https://www.google-analytics.com/analytics.js')).toBe(
      'www.google-analytics.com',
    );
  });

  it('extracts hostname from URL with query string', () => {
    expect(engine.extractDomain('https://www.facebook.com/tr?id=123&ev=PageView')).toBe(
      'www.facebook.com',
    );
  });

  it('returns the input as-is when it is not a valid URL', () => {
    expect(engine.extractDomain('not-a-url')).toBe('not-a-url');
  });

  it('handles URLs with ports', () => {
    expect(engine.extractDomain('https://localhost:3000/path')).toBe('localhost');
  });
});
