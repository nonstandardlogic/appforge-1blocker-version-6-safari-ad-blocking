import reducer, {
  addRule,
  editRule,
  toggleRule,
  deleteRule,
  clearValidationError,
  importRules,
} from '../customRulesSlice';
import { CustomRule } from '../types';

const INIT = { type: '@@INIT' } as any;

function makeRule(overrides: Partial<CustomRule> = {}): CustomRule {
  return {
    id: 'test-rule-id',
    pattern: 'ads.example.com',
    enabled: true,
    createdAt: '2026-06-10T00:00:00.000Z',
    ...overrides,
  };
}

describe('customRulesSlice — NSL1V6SAB-24: initial state', () => {
  it('starts with empty rules list', () => {
    expect(reducer(undefined, INIT).rules).toHaveLength(0);
  });

  it('starts with no validation error', () => {
    expect(reducer(undefined, INIT).validationError).toBeNull();
  });
});

describe('customRulesSlice — NSL1V6SAB-24: addRule', () => {
  it('adds a valid rule to the list', () => {
    const state = reducer(undefined, addRule('ads.example.com'));
    expect(state.rules).toHaveLength(1);
    expect(state.rules[0].pattern).toBe('ads.example.com');
  });

  it('new rule starts enabled', () => {
    const state = reducer(undefined, addRule('ads.example.com'));
    expect(state.rules[0].enabled).toBe(true);
  });

  it('new rule has a non-empty id', () => {
    const state = reducer(undefined, addRule('ads.example.com'));
    expect(state.rules[0].id).toBeTruthy();
  });

  it('new rule has createdAt timestamp', () => {
    const state = reducer(undefined, addRule('ads.example.com'));
    expect(new Date(state.rules[0].createdAt).toISOString()).toBe(state.rules[0].createdAt);
  });

  it('does NOT add an empty-pattern rule', () => {
    const state = reducer(undefined, addRule(''));
    expect(state.rules).toHaveLength(0);
  });

  it('sets validationError for an empty pattern', () => {
    const state = reducer(undefined, addRule(''));
    expect(state.validationError).toBeTruthy();
  });

  it('clears validationError when a valid rule is added after an invalid one', () => {
    let state = reducer(undefined, addRule(''));
    state = reducer(state, addRule('valid.example.com'));
    expect(state.validationError).toBeNull();
  });

  it('does NOT add a rule with invalid regex', () => {
    const state = reducer(undefined, addRule('[bad-regex'));
    expect(state.rules).toHaveLength(0);
    expect(state.validationError).toBeTruthy();
  });
});

describe('customRulesSlice — NSL1V6SAB-24: editRule', () => {
  it('updates the pattern of an existing rule', () => {
    let state = reducer(undefined, addRule('old-pattern.com'));
    const id = state.rules[0].id;
    state = reducer(state, editRule({ id, pattern: 'new-pattern.com' }));
    expect(state.rules[0].pattern).toBe('new-pattern.com');
  });

  it('sets validationError and leaves rule unchanged if new pattern is invalid', () => {
    let state = reducer(undefined, addRule('valid.com'));
    const id = state.rules[0].id;
    state = reducer(state, editRule({ id, pattern: '' }));
    expect(state.validationError).toBeTruthy();
    expect(state.rules[0].pattern).toBe('valid.com');
  });

  it('does nothing if id does not match any rule', () => {
    const state = reducer(undefined, editRule({ id: 'nonexistent', pattern: 'good.com' }));
    expect(state.rules).toHaveLength(0);
  });
});

describe('customRulesSlice — NSL1V6SAB-24: toggleRule', () => {
  it('disables an enabled rule', () => {
    let state = reducer(undefined, addRule('ads.example.com'));
    const id = state.rules[0].id;
    state = reducer(state, toggleRule(id));
    expect(state.rules[0].enabled).toBe(false);
  });

  it('re-enables a disabled rule', () => {
    let state = reducer(undefined, addRule('ads.example.com'));
    const id = state.rules[0].id;
    state = reducer(state, toggleRule(id));
    state = reducer(state, toggleRule(id));
    expect(state.rules[0].enabled).toBe(true);
  });
});

describe('customRulesSlice — NSL1V6SAB-24: deleteRule', () => {
  it('removes the rule with the given id', () => {
    let state = reducer(undefined, addRule('ads.example.com'));
    const id = state.rules[0].id;
    state = reducer(state, deleteRule(id));
    expect(state.rules).toHaveLength(0);
  });

  it('only removes the targeted rule', () => {
    let state = reducer(undefined, addRule('rule1.com'));
    state = reducer(state, addRule('rule2.com'));
    const id = state.rules[0].id;
    state = reducer(state, deleteRule(id));
    expect(state.rules).toHaveLength(1);
    expect(state.rules[0].pattern).toBe('rule2.com');
  });
});

describe('customRulesSlice — NSL1V6SAB-24: clearValidationError', () => {
  it('clears the validation error', () => {
    let state = reducer(undefined, addRule(''));
    state = reducer(state, clearValidationError());
    expect(state.validationError).toBeNull();
  });
});

describe('customRulesSlice — NSL1V6SAB-25: importRules', () => {
  it('adds imported rules to the list', () => {
    const newRules: CustomRule[] = [makeRule({ id: 'imp-1', pattern: 'imported.com' })];
    const state = reducer(undefined, importRules(newRules));
    expect(state.rules).toHaveLength(1);
    expect(state.rules[0].pattern).toBe('imported.com');
  });

  it('does not add a duplicate rule already in state', () => {
    let state = reducer(undefined, addRule('existing.com'));
    const existing = { ...state.rules[0] };
    state = reducer(state, importRules([existing]));
    expect(state.rules).toHaveLength(1);
  });

  it('merges imported rules with existing without removing existing', () => {
    let state = reducer(undefined, addRule('existing.com'));
    const newRule = makeRule({ id: 'imp-1', pattern: 'new.com' });
    state = reducer(state, importRules([newRule]));
    expect(state.rules).toHaveLength(2);
  });

  it('handles intra-batch duplicates during import', () => {
    const dup = makeRule({ id: 'imp-1', pattern: 'dup.com' });
    const dup2 = makeRule({ id: 'imp-2', pattern: 'dup.com' });
    const state = reducer(undefined, importRules([dup, dup2]));
    expect(state.rules).toHaveLength(1);
  });
});
