import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomRule } from './types';
import { CustomRuleValidator } from './CustomRuleValidator';

interface CustomRulesState {
  rules: CustomRule[];
  validationError: string | null;
}

const initialState: CustomRulesState = {
  rules: [],
  validationError: null,
};

const validator = new CustomRuleValidator();

function generateId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const customRulesSlice = createSlice({
  name: 'customRules',
  initialState,
  reducers: {
    addRule(state, action: PayloadAction<string>) {
      const pattern = action.payload.trim();
      const result = validator.validate(pattern);
      if (!result.valid) {
        state.validationError = result.error!;
        return;
      }
      state.validationError = null;
      state.rules.push({
        id: generateId(),
        pattern,
        enabled: true,
        createdAt: new Date().toISOString(),
      });
    },
    editRule(state, action: PayloadAction<{ id: string; pattern: string }>) {
      const { id, pattern } = action.payload;
      const trimmed = pattern.trim();
      const result = validator.validate(trimmed);
      if (!result.valid) {
        state.validationError = result.error!;
        return;
      }
      const rule = state.rules.find(r => r.id === id);
      if (rule) {
        rule.pattern = trimmed;
        state.validationError = null;
      }
    },
    toggleRule(state, action: PayloadAction<string>) {
      const rule = state.rules.find(r => r.id === action.payload);
      if (rule) {
        rule.enabled = !rule.enabled;
      }
    },
    deleteRule(state, action: PayloadAction<string>) {
      state.rules = state.rules.filter(r => r.id !== action.payload);
    },
    clearValidationError(state) {
      state.validationError = null;
    },
    importRules(state, action: PayloadAction<CustomRule[]>) {
      const existingPatterns = new Set(state.rules.map(r => r.pattern));
      for (const rule of action.payload) {
        if (!existingPatterns.has(rule.pattern)) {
          state.rules.push(rule);
          existingPatterns.add(rule.pattern);
        }
      }
    },
  },
});

export const {
  addRule,
  editRule,
  toggleRule,
  deleteRule,
  clearValidationError,
  importRules,
} = customRulesSlice.actions;
export default customRulesSlice.reducer;
