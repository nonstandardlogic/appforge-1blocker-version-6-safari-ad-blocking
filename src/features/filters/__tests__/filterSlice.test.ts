import reducer, { toggleCategory, toggleSubcategory, setCategoryEnabled } from '../filterSlice';
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
    expect(state.categories.find(c => c.id === FilterCategoryId.TRACKERS)!.enabled).toBe(true);
    expect(state.categories.find(c => c.id === FilterCategoryId.SOCIAL_WIDGETS)!.enabled).toBe(true);
  });

  it('setCategoryEnabled explicitly disables a category', () => {
    const state = reducer(
      undefined,
      setCategoryEnabled({ id: FilterCategoryId.COOKIE_NOTICES, enabled: false })
    );
    expect(state.categories.find(c => c.id === FilterCategoryId.COOKIE_NOTICES)!.enabled).toBe(false);
  });

  it('setCategoryEnabled explicitly re-enables a disabled category', () => {
    let state = reducer(undefined, toggleCategory(FilterCategoryId.TRACKERS));
    state = reducer(state, setCategoryEnabled({ id: FilterCategoryId.TRACKERS, enabled: true }));
    expect(state.categories.find(c => c.id === FilterCategoryId.TRACKERS)!.enabled).toBe(true);
  });

  it('each category has a non-empty label string', () => {
    const state = reducer(undefined, INIT);
    state.categories.forEach(cat => {
      expect(cat.label.length).toBeGreaterThan(0);
    });
  });
});

describe('filterSlice — NSL1V6SAB-23: subcategory controls', () => {
  it('each category has at least one subcategory', () => {
    const state = reducer(undefined, INIT);
    state.categories.forEach(cat => {
      expect(cat.subcategories.length).toBeGreaterThan(0);
    });
  });

  it('all subcategories start enabled', () => {
    const state = reducer(undefined, INIT);
    state.categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        expect(sub.enabled).toBe(true);
      });
    });
  });

  it('ADS category has VIDEO_ADS, BANNER_ADS, SPONSORED_LINKS', () => {
    const state = reducer(undefined, INIT);
    const ads = state.categories.find(c => c.id === FilterCategoryId.ADS)!;
    const subIds = ads.subcategories.map(s => s.id);
    expect(subIds).toContain(FilterSubcategoryId.VIDEO_ADS);
    expect(subIds).toContain(FilterSubcategoryId.BANNER_ADS);
    expect(subIds).toContain(FilterSubcategoryId.SPONSORED_LINKS);
  });

  it('COOKIE_NOTICES category has COOKIE_CONSENT_BANNERS and GDPR_NOTICES', () => {
    const state = reducer(undefined, INIT);
    const cat = state.categories.find(c => c.id === FilterCategoryId.COOKIE_NOTICES)!;
    const subIds = cat.subcategories.map(s => s.id);
    expect(subIds).toContain(FilterSubcategoryId.COOKIE_CONSENT_BANNERS);
    expect(subIds).toContain(FilterSubcategoryId.GDPR_NOTICES);
  });

  it('toggleSubcategory disables a subcategory while parent category stays enabled', () => {
    const state = reducer(
      undefined,
      toggleSubcategory({ categoryId: FilterCategoryId.ADS, subcategoryId: FilterSubcategoryId.VIDEO_ADS })
    );
    const ads = state.categories.find(c => c.id === FilterCategoryId.ADS)!;
    expect(ads.enabled).toBe(true); // parent still enabled
    expect(ads.subcategories.find(s => s.id === FilterSubcategoryId.VIDEO_ADS)!.enabled).toBe(false);
  });

  it('toggleSubcategory re-enables a disabled subcategory', () => {
    let state = reducer(
      undefined,
      toggleSubcategory({ categoryId: FilterCategoryId.ADS, subcategoryId: FilterSubcategoryId.VIDEO_ADS })
    );
    state = reducer(
      state,
      toggleSubcategory({ categoryId: FilterCategoryId.ADS, subcategoryId: FilterSubcategoryId.VIDEO_ADS })
    );
    const ads = state.categories.find(c => c.id === FilterCategoryId.ADS)!;
    expect(ads.subcategories.find(s => s.id === FilterSubcategoryId.VIDEO_ADS)!.enabled).toBe(true);
  });

  it('toggling one subcategory does not affect sibling subcategories', () => {
    const state = reducer(
      undefined,
      toggleSubcategory({ categoryId: FilterCategoryId.ADS, subcategoryId: FilterSubcategoryId.VIDEO_ADS })
    );
    const ads = state.categories.find(c => c.id === FilterCategoryId.ADS)!;
    expect(ads.subcategories.find(s => s.id === FilterSubcategoryId.BANNER_ADS)!.enabled).toBe(true);
    expect(ads.subcategories.find(s => s.id === FilterSubcategoryId.SPONSORED_LINKS)!.enabled).toBe(true);
  });

  it('toggling a subcategory in one category does not affect subcategories in another', () => {
    const state = reducer(
      undefined,
      toggleSubcategory({ categoryId: FilterCategoryId.ADS, subcategoryId: FilterSubcategoryId.VIDEO_ADS })
    );
    const trackers = state.categories.find(c => c.id === FilterCategoryId.TRACKERS)!;
    trackers.subcategories.forEach(sub => {
      expect(sub.enabled).toBe(true);
    });
  });

  it('state is JSON-serializable for MMKV persistence (NSL1V6SAB-23 AC3)', () => {
    const state = reducer(
      undefined,
      toggleSubcategory({ categoryId: FilterCategoryId.COOKIE_NOTICES, subcategoryId: FilterSubcategoryId.GDPR_NOTICES })
    );
    const serialized = JSON.stringify(state);
    const restored = JSON.parse(serialized);
    const cat = restored.categories.find((c: any) => c.id === FilterCategoryId.COOKIE_NOTICES);
    const sub = cat.subcategories.find((s: any) => s.id === FilterSubcategoryId.GDPR_NOTICES);
    expect(sub.enabled).toBe(false);
  });

  it('each subcategory carries its parentCategoryId', () => {
    const state = reducer(undefined, INIT);
    state.categories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        expect(sub.parentCategoryId).toBe(cat.id);
      });
    });
  });
});
