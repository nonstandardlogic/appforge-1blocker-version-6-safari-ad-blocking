import reducer, {
  addRule,
  removeRule,
  toggleRule,
  setRuleEnabled,
  reorderRules,
  getRuleByValue,
} from '../firewallRulesSlice';
import { FirewallRulesState } from '../types';

const makeAdd = (overrides: {
  id?: string;
  type?: 'domain' | 'cidr';
  value?: string;
  createdAt?: string;
} = {}) =>
  addRule({
    id: overrides.id ?? 'rule-1',
    type: overrides.type ?? 'domain',
    value: overrides.value ?? 'ads.example.com',
    createdAt: overrides.createdAt ?? '2026-06-10T00:00:00Z',
  });

describe('firewallRulesSlice', () => {
  const initialState: FirewallRulesState = { rules: [] };

  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // AC1: Given I add a domain to the block list, DNS lookups for that domain return NXDOMAIN
  describe('AC1 — adding a domain rule', () => {
    it('adds a domain rule to the list', () => {
      const state = reducer(initialState, makeAdd());
      expect(state.rules).toHaveLength(1);
      expect(state.rules[0].type).toBe('domain');
      expect(state.rules[0].value).toBe('ads.example.com');
    });

    it('enables the rule by default', () => {
      const state = reducer(initialState, makeAdd());
      expect(state.rules[0].enabled).toBe(true);
    });

    it('can look up a rule by its domain value', () => {
      const state = reducer(initialState, makeAdd());
      expect(getRuleByValue(state, 'ads.example.com')).toBeDefined();
    });
  });

  // AC2: Given I add a CIDR block, traffic destined for that range is dropped
  describe('AC2 — adding a CIDR rule', () => {
    it('adds a CIDR rule to the list', () => {
      const state = reducer(initialState, makeAdd({ id: 'cidr-1', type: 'cidr', value: '192.168.1.0/24' }));
      expect(state.rules[0].type).toBe('cidr');
      expect(state.rules[0].value).toBe('192.168.1.0/24');
    });

    it('can hold both domain and CIDR rules simultaneously', () => {
      let state = reducer(initialState, makeAdd({ id: 'r1', type: 'domain', value: 'ads.example.com' }));
      state = reducer(state, makeAdd({ id: 'r2', type: 'cidr', value: '10.0.0.0/8' }));
      expect(state.rules).toHaveLength(2);
    });
  });

  // AC3: Given I have added rules, I can search, reorder, enable/disable, and delete them
  describe('AC3 — managing rules', () => {
    it('removes a rule by ID', () => {
      const withRule = reducer(initialState, makeAdd({ id: 'r1' }));
      const state = reducer(withRule, removeRule('r1'));
      expect(state.rules).toHaveLength(0);
    });

    it('toggles a rule between enabled and disabled', () => {
      const withRule = reducer(initialState, makeAdd({ id: 'r1' }));
      const disabled = reducer(withRule, toggleRule('r1'));
      expect(disabled.rules[0].enabled).toBe(false);
      const enabled = reducer(disabled, toggleRule('r1'));
      expect(enabled.rules[0].enabled).toBe(true);
    });

    it('can explicitly set a rule enabled or disabled', () => {
      const withRule = reducer(initialState, makeAdd({ id: 'r1' }));
      const disabled = reducer(withRule, setRuleEnabled({ id: 'r1', enabled: false }));
      expect(disabled.rules[0].enabled).toBe(false);
      const enabled = reducer(disabled, setRuleEnabled({ id: 'r1', enabled: true }));
      expect(enabled.rules[0].enabled).toBe(true);
    });

    it('reorders rules according to a new ID sequence', () => {
      let state = reducer(initialState, makeAdd({ id: 'r1', value: 'a.com' }));
      state = reducer(state, makeAdd({ id: 'r2', value: 'b.com' }));
      state = reducer(state, makeAdd({ id: 'r3', value: 'c.com' }));
      const reordered = reducer(state, reorderRules(['r3', 'r1', 'r2']));
      expect(reordered.rules[0].id).toBe('r3');
      expect(reordered.rules[1].id).toBe('r1');
      expect(reordered.rules[2].id).toBe('r2');
    });

    it('exposes the rule value field for search', () => {
      const state = reducer(initialState, makeAdd({ value: 'tracker.example.com' }));
      expect(state.rules[0].value).toBe('tracker.example.com');
    });
  });
});
