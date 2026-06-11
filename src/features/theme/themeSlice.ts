import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ColorScheme = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

export interface ThemeState {
  colorScheme: ColorScheme;
  activeTheme: ActiveTheme;
}

const initialState: ThemeState = {
  colorScheme: 'system',
  activeTheme: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setColorScheme(state, action: PayloadAction<ColorScheme>) {
      state.colorScheme = action.payload;
    },
    systemThemeChanged(state, action: PayloadAction<ActiveTheme>) {
      if (state.colorScheme === 'system') {
        state.activeTheme = action.payload;
      }
    },
  },
});

export const { setColorScheme, systemThemeChanged } = themeSlice.actions;

export function resolveTheme(state: ThemeState): ActiveTheme {
  if (state.colorScheme === 'system') {
    return state.activeTheme;
  }
  return state.colorScheme;
}

export default themeSlice.reducer;
