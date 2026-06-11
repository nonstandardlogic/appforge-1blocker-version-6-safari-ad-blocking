import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TextSizeCategory =
  | 'xSmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'xLarge'
  | 'xxLarge'
  | 'xxxLarge'
  | 'accessibilityMedium'
  | 'accessibilityLarge'
  | 'accessibilityExtraLarge'
  | 'accessibilityExtraExtraLarge'
  | 'accessibilityExtraExtraExtraLarge';

export interface AccessibilityState {
  textSizeCategory: TextSizeCategory;
  voiceOverEnabled: boolean;
  minimumTouchTargetPoints: 44;
}

const initialState: AccessibilityState = {
  textSizeCategory: 'large',
  voiceOverEnabled: false,
  minimumTouchTargetPoints: 44,
};

const accessibilitySlice = createSlice({
  name: 'accessibility',
  initialState,
  reducers: {
    setTextSizeCategory(state, action: PayloadAction<TextSizeCategory>) {
      state.textSizeCategory = action.payload;
    },
    setVoiceOverEnabled(state, action: PayloadAction<boolean>) {
      state.voiceOverEnabled = action.payload;
    },
  },
});

export const { setTextSizeCategory, setVoiceOverEnabled } = accessibilitySlice.actions;

export default accessibilitySlice.reducer;
