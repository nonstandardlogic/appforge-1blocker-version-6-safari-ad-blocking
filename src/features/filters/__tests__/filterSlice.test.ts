import reducer, { toggleCategory, setCategoryEnabled } from '../filterSlice';
import { FilterCategoryId, FilterSubcategoryId } from '../types';

const INIT = { type: '@@INIT' } as any;

describe('filterSlice — NSL1V6SAB-22: category toggles', () => {
  it('all 5 categories start enabled', () => {
    const state = reducer(undefined, INIT);
    state.categories.forEach(cat => {
      expect(cat.enabled).toBe(true);
    });
  });

  it('contains all 5 expected categories', () => {
    const state = reducer(undefined, INIT);
    const ids = state.categories.map(c => c.id);
    expect(ids).toContain(FilterCategoryId.ADS);
    expect(ids).toContain(FilterCategoryId.TRACKERS);
    expect(ids).toContain(FilterCategoryId.SOCIAL_WIDGETS);
    expect(ids).toContain(FilterCategoryId.COOKIE_NOTICES);
    expect(ids).toContain(FilterCategoryId.ANNOYANCES);
  });

  it('toggleCategory disables an enabled category', () => {
    const state = reducer(undefined, toggleCategory(FilterCategoryId.ADS));
    const ads = state.categories.find(c => c.id === FilterCategoryId.ADS)!;
    expect(ads.enabled).toBe(false);
  });

  it('toggleCategory re-enables a disabled category', () => {
    let state = reducer(undefined, toggleCategory(FilterCategoryId.ADS));
    state = reducer(state, toggleCategory(FilterCategoryId.ADS));
    const ads = state.categories.find(c => c.id === FilterCategoryId.ADS)!;
    expect(ads.enabled).toBe(true);
  });

  it('toggling one category does not affect others', () => {
    const state = reducer(undefined, toggleCategory(FilterCategoryId.ADS));
    const trackers = state.categories.find(c => c.id === FilterCategoryId.TRACKERS)!;
    expect(trackers.enabled).toBe(true);
    const social = state.categories.find(c => c.id === FilterCategoryId.SOCIAL_WIDGETS)!;
    expect(social.enabled).toBe(true);
  });

  it('setCategoryEnabled explicitly disables a category', () => {
    const state = reducer(
      undefined,
      setCategoryEnabled({ id: FilterCategoryId.COOKIE_NOTICES, enabled: false })
    );
    const cat = state.categories.find(c => c.id === FilterCategoryId.COOKIE_NOTICES)!;
    expect(cat.enabled).toBe(false);
  });

  it('setCategoryEnabled explicitly re-enables a category', () => {
    let state = reducer(undefined, toggleCategory(FilterCategoryId.TRACKERS));
    state = reducer(state, setCategoryEnabled({ id: FilterCategoryId.TRACKERS, enabled: true }));
    const cat = state.categories.find(c => c.id === FilterCategoryId.TRACKERS)!;
    expect(cat.enabled).toBe(true);
  });

  it('each category has a label string', () => {
    const state = reducer(undefined, INIT);
    state.categories.forEach(cat => {
      expect(typeof cat.label).toBe('string');
      expect(cat.label.length).toBeGreaterThan(0);
    });
  });
});

export { FilterSubcategoryId }; // used in NSL1V6SAB-23 tests below
