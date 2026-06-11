import reducer, {
  setTextSizeCategory,
  setVoiceOverEnabled,
  AccessibilityState,
} from '../accessibilitySlice';

const initial: AccessibilityState = {
  textSizeCategory: 'large',
  voiceOverEnabled: false,
  minimumTouchTargetPoints: 44,
};

describe('accessibilitySlice', () => {
  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('minimumTouchTargetPoints is always 44', () => {
    const state = reducer(initial, setTextSizeCategory('xSmall'));
    expect(state.minimumTouchTargetPoints).toBe(44);
  });

  it('setTextSizeCategory updates textSizeCategory', () => {
    const state = reducer(initial, setTextSizeCategory('xxxLarge'));
    expect(state.textSizeCategory).toBe('xxxLarge');
  });

  it('setTextSizeCategory supports all accessibility sizes', () => {
    const sizes = [
      'xSmall', 'small', 'medium', 'large', 'xLarge', 'xxLarge', 'xxxLarge',
      'accessibilityMedium', 'accessibilityLarge', 'accessibilityExtraLarge',
      'accessibilityExtraExtraLarge', 'accessibilityExtraExtraExtraLarge',
    ] as const;
    for (const size of sizes) {
      const state = reducer(initial, setTextSizeCategory(size));
      expect(state.textSizeCategory).toBe(size);
    }
  });

  it('setVoiceOverEnabled sets voiceOverEnabled to true', () => {
    const state = reducer(initial, setVoiceOverEnabled(true));
    expect(state.voiceOverEnabled).toBe(true);
  });

  it('setVoiceOverEnabled sets voiceOverEnabled to false', () => {
    const state = reducer({ ...initial, voiceOverEnabled: true }, setVoiceOverEnabled(false));
    expect(state.voiceOverEnabled).toBe(false);
  });

  it('setVoiceOverEnabled does not affect textSizeCategory', () => {
    const state = reducer(initial, setVoiceOverEnabled(true));
    expect(state.textSizeCategory).toBe('large');
  });
});
