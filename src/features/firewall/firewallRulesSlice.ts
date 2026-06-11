import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FirewallRule, FirewallRuleType, FirewallRulesState } from './types';

const initialState: FirewallRulesState = {
  rules: [],
};

const firewallRulesSlice = createSlice({
  name: 'firewallRules',
  initialState,
  reducers: {
    addRule(
      state,
      action: PayloadAction<{ id: string; type: FirewallRuleType; value: string; createdAt: string }>
    ) {
      const { id, type, value, createdAt } = action.payload;
      state.rules.push({ id, type, value, enabled: true, createdAt });
    },
    removeRule(state, action: PayloadAction<string>) {
      state.rules = state.rules.filter(r => r.id !== action.payload);
    },
    toggleRule(state, action: PayloadAction<string>) {
      const rule = state.rules.find(r => r.id === action.payload);
      if (rule) rule.enabled = !rule.enabled;
    },
    setRuleEnabled(state, action: PayloadAction<{ id: string; enabled: boolean }>) {
      const rule = state.rules.find(r => r.id === action.payload.id);
      if (rule) rule.enabled = action.payload.enabled;
    },
    reorderRules(state, action: PayloadAction<string[]>) {
      const idOrder = action.payload;
      const ruleMap = new Map(state.rules.map(r => [r.id, r]));
      const reordered = idOrder
        .map(id => ruleMap.get(id))
        .filter((r): r is FirewallRule => r !== undefined);
      state.rules = reordered;
    },
  },
});

export const { addRule, removeRule, toggleRule, setRuleEnabled, reorderRules } =
  firewallRulesSlice.actions;

export function getRuleByValue(
  state: FirewallRulesState,
  value: string
): FirewallRule | undefined {
  return state.rules.find(r => r.value === value);
}

export default firewallRulesSlice.reducer;
