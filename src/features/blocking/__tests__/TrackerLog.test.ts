import { TrackerLog } from '../TrackerLog';

describe('TrackerLog', () => {
  let log: TrackerLog;

  beforeEach(() => {
    log = new TrackerLog();
  });

  describe('record()', () => {
    it('records a tracker block event with required fields', () => {
      const event = log.record('analytics.google.com', 'https://example.com');
      expect(event.trackerDomain).toBe('analytics.google.com');
      expect(event.hostPage).toBe('https://example.com');
      expect(event.category).toBe('TRACKER');
      expect(event.id).toBeTruthy();
      expect(event.blockedAt).toBeTruthy();
    });

    it('accepts AD category', () => {
      const event = log.record('ads.example.com', 'https://example.com', 'AD');
      expect(event.category).toBe('AD');
    });

    it('prepends new events so most-recent is first', () => {
      log.record('tracker1.com', 'https://site.com');
      log.record('tracker2.com', 'https://site.com');
      const all = log.getAll();
      expect(all[0].trackerDomain).toBe('tracker2.com');
      expect(all[1].trackerDomain).toBe('tracker1.com');
    });

    it('generates unique IDs for each event', () => {
      const a = log.record('a.com', 'https://site.com');
      const b = log.record('b.com', 'https://site.com');
      expect(a.id).not.toBe(b.id);
    });

    it('records a valid ISO 8601 blockedAt timestamp', () => {
      const event = log.record('t.com', 'https://site.com');
      expect(() => new Date(event.blockedAt).toISOString()).not.toThrow();
    });
  });

  describe('getAll()', () => {
    it('returns empty array when no events recorded', () => {
      expect(log.getAll()).toEqual([]);
    });

    it('returns a copy so mutations do not affect internal state', () => {
      log.record('t.com', 'https://site.com');
      const copy = log.getAll();
      copy.splice(0);
      expect(log.count()).toBe(1);
    });
  });

  describe('getByDomain()', () => {
    it('returns only events for the specified domain', () => {
      log.record('hotjar.com', 'https://site.com');
      log.record('google-analytics.com', 'https://site.com');
      log.record('hotjar.com', 'https://other.com');
      const results = log.getByDomain('hotjar.com');
      expect(results).toHaveLength(2);
      results.forEach(e => expect(e.trackerDomain).toBe('hotjar.com'));
    });

    it('returns empty array for unknown domain', () => {
      expect(log.getByDomain('unknown.com')).toEqual([]);
    });
  });

  describe('getByHostPage()', () => {
    it('returns only events for the specified host page', () => {
      log.record('t.com', 'https://news.example.com');
      log.record('t.com', 'https://shop.example.com');
      const results = log.getByHostPage('https://news.example.com');
      expect(results).toHaveLength(1);
      expect(results[0].hostPage).toBe('https://news.example.com');
    });
  });

  describe('clear()', () => {
    it('removes all events and resets count to zero', () => {
      log.record('t.com', 'https://site.com');
      log.record('t2.com', 'https://site.com');
      log.clear();
      expect(log.count()).toBe(0);
      expect(log.getAll()).toEqual([]);
    });
  });

  describe('count()', () => {
    it('tracks the number of recorded events', () => {
      expect(log.count()).toBe(0);
      log.record('a.com', 'https://site.com');
      expect(log.count()).toBe(1);
      log.record('b.com', 'https://site.com');
      expect(log.count()).toBe(2);
    });
  });

  describe('MAX_EVENTS cap (500)', () => {
    it('does not exceed 500 stored events', () => {
      for (let i = 0; i < 510; i++) {
        log.record(`tracker${i}.com`, 'https://site.com');
      }
      expect(log.count()).toBe(500);
    });

    it('keeps the most-recent events when cap is exceeded', () => {
      for (let i = 0; i < 505; i++) {
        log.record(`tracker${i}.com`, 'https://site.com');
      }
      expect(log.getAll()[0].trackerDomain).toBe('tracker504.com');
    });
  });
});
