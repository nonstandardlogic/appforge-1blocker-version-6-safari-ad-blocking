import reducer, {
  enableInAppBlocking,
  disableInAppBlocking,
  logBlockedRequest,
  clearBlockingLog,
} from '../inAppBlockingSlice';
import { BlockedRequestType, InAppBlockingState } from '../types';

const makeRequest = (overrides: Partial<import('../types').BlockedRequest> = {}): import('../types').BlockedRequest => ({
  id: 'req-1',
  appBundleId: 'com.example.app',
  appName: 'Example App',
  requestType: BlockedRequestType.AD,
  url: 'https://ads.example.com/banner',
  blockedAt: '2026-06-10T10:00:00.000Z',
  ...overrides,
});

describe('inAppBlockingSlice', () => {
  const initialState: InAppBlockingState = {
    enabled: false,
    blockingLog: [],
  };

  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('enableInAppBlocking / disableInAppBlocking', () => {
    it('enables in-app blocking', () => {
      const state = reducer(initialState, enableInAppBlocking());
      expect(state.enabled).toBe(true);
    });

    it('disables in-app blocking', () => {
      const enabled = { ...initialState, enabled: true };
      const state = reducer(enabled, disableInAppBlocking());
      expect(state.enabled).toBe(false);
    });
  });

  // AC1: Given in-app blocking is enabled, when a third-party app displays ads, those ads are not rendered
  describe('AC1 — ads blocked when in-app blocking is enabled', () => {
    it('logs a blocked ad request when blocking is enabled', () => {
      const enabled = { ...initialState, enabled: true };
      const req = makeRequest();
      const state = reducer(enabled, logBlockedRequest(req));
      expect(state.blockingLog).toHaveLength(1);
      expect(state.blockingLog[0]).toEqual(req);
    });

    it('does not log requests when blocking is disabled', () => {
      const req = makeRequest();
      const state = reducer(initialState, logBlockedRequest(req));
      expect(state.blockingLog).toHaveLength(0);
    });
  });

  // AC2: Given in-app blocking is active, app core functionality is unaffected
  describe('AC2 — blocking log is consistent and clearable', () => {
    it('accumulates multiple blocked requests', () => {
      const enabled = { ...initialState, enabled: true };
      const adReq = makeRequest({ requestType: BlockedRequestType.AD });
      const trackerReq = makeRequest({ id: 'req-2', requestType: BlockedRequestType.TRACKER });
      let state = reducer(enabled, logBlockedRequest(adReq));
      state = reducer(state, logBlockedRequest(trackerReq));
      expect(state.blockingLog).toHaveLength(2);
    });

    it('clearBlockingLog empties the log without affecting enabled state', () => {
      const withLog: InAppBlockingState = {
        enabled: true,
        blockingLog: [makeRequest()],
      };
      const state = reducer(withLog, clearBlockingLog());
      expect(state.blockingLog).toHaveLength(0);
      expect(state.enabled).toBe(true);
    });
  });

  // AC3: Given in-app blocking is enabled, blocked requests are attributed to the correct app name
  describe('AC3 — blocked requests attributed to correct app', () => {
    it('attributes a blocked request to the correct app name and bundleId', () => {
      const enabled = { ...initialState, enabled: true };
      const req = makeRequest({ appName: 'News App', appBundleId: 'com.news.app' });
      const state = reducer(enabled, logBlockedRequest(req));
      expect(state.blockingLog[0].appName).toBe('News App');
      expect(state.blockingLog[0].appBundleId).toBe('com.news.app');
    });

    it('attributes multiple requests from different apps correctly', () => {
      const enabled = { ...initialState, enabled: true };
      const req1 = makeRequest({ id: 'r1', appName: 'App A', appBundleId: 'com.a.app' });
      const req2 = makeRequest({ id: 'r2', appName: 'App B', appBundleId: 'com.b.app' });
      let state = reducer(enabled, logBlockedRequest(req1));
      state = reducer(state, logBlockedRequest(req2));
      expect(state.blockingLog[0].appName).toBe('App A');
      expect(state.blockingLog[1].appName).toBe('App B');
    });
  });
});
