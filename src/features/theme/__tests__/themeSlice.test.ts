import reducer, {
  setColorScheme,
  systemThemeChanged,
  resolveTheme,
  ThemeState,
} from '../themeSlice';

const initial: ThemeState = {
  colorScheme: 'system',
  activeTheme: 'light',
};

describe('themeSlice', () => {
  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('setColorScheme updates colorScheme', () => {
    const state = reducer(initial, setColorScheme('dark'));
    expect(state.colorScheme).toBe('dark');
  });

  it('systemThemeChanged updates activeTheme when colorScheme is system', () => {
    const state = reducer({ ...initial, colorScheme: 'system' }, systemThemeChanged('dark'));
    expect(state.activeTheme).toBe('dark');
  });

  it('systemThemeChanged does NOT update activeTheme when colorScheme is light', () => {
    const state = reducer({ colorScheme: 'light', activeTheme: 'light' }, systemThemeChanged('dark'));
    expect(state.activeTheme).toBe('light');
  });

  it('systemThemeChanged does NOT update activeTheme when colorScheme is dark', () => {
    const state = reducer({ colorScheme: 'dark', activeTheme: 'light' }, systemThemeChanged('light'));
    expect(state.activeTheme).toBe('light');
  });
});

describe('resolveTheme', () => {
  it('returns activeTheme when colorScheme is system', () => {
    expect(resolveTheme({ colorScheme: 'system', activeTheme: 'dark' })).toBe('dark');
  });

  it('returns light when colorScheme is light regardless of activeTheme', () => {
    expect(resolveTheme({ colorScheme: 'light', activeTheme: 'dark' })).toBe('light');
  });

  it('returns dark when colorScheme is dark regardless of activeTheme', () => {
    expect(resolveTheme({ colorScheme: 'dark', activeTheme: 'light' })).toBe('dark');
  });
});
