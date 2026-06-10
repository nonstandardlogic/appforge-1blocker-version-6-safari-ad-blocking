import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterCategory, FilterCategoryId, FilterSubcategoryId } from './types';

const INITIAL_CATEGORIES: FilterCategory[] = [
  {
    id: FilterCategoryId.ADS,
    label: 'Ads',
    enabled: true,
    subcategories: [
      { id: FilterSubcategoryId.BANNER_ADS, parentCategoryId: FilterCategoryId.ADS, label: 'Banner Ads', enabled: true },
      { id: FilterSubcategoryId.VIDEO_ADS, parentCategoryId: FilterCategoryId.ADS, label: 'Video Ads', enabled: true },
      { id: FilterSubcategoryId.SPONSORED_LINKS, parentCategoryId: FilterCategoryId.ADS, label: 'Sponsored Links', enabled: true },
    ],
  },
  {
    id: FilterCategoryId.TRACKERS,
    label: 'Trackers',
    enabled: true,
    subcategories: [
      { id: FilterSubcategoryId.ANALYTICS, parentCategoryId: FilterCategoryId.TRACKERS, label: 'Analytics', enabled: true },
      { id: FilterSubcategoryId.CROSS_SITE_TRACKERS, parentCategoryId: FilterCategoryId.TRACKERS, label: 'Cross-Site Trackers', enabled: true },
      { id: FilterSubcategoryId.FINGERPRINTING, parentCategoryId: FilterCategoryId.TRACKERS, label: 'Fingerprinting', enabled: true },
    ],
  },
  {
    id: FilterCategoryId.SOCIAL_WIDGETS,
    label: 'Social Widgets',
    enabled: true,
    subcategories: [
      { id: FilterSubcategoryId.SOCIAL_BUTTONS, parentCategoryId: FilterCategoryId.SOCIAL_WIDGETS, label: 'Social Buttons', enabled: true },
      { id: FilterSubcategoryId.COMMENT_WIDGETS, parentCategoryId: FilterCategoryId.SOCIAL_WIDGETS, label: 'Comment Widgets', enabled: true },
    ],
  },
  {
    id: FilterCategoryId.COOKIE_NOTICES,
    label: 'Cookie Notices',
    enabled: true,
    subcategories: [
      { id: FilterSubcategoryId.COOKIE_CONSENT_BANNERS, parentCategoryId: FilterCategoryId.COOKIE_NOTICES, label: 'Cookie Consent Banners', enabled: true },
      { id: FilterSubcategoryId.GDPR_NOTICES, parentCategoryId: FilterCategoryId.COOKIE_NOTICES, label: 'GDPR Notices', enabled: true },
    ],
  },
  {
    id: FilterCategoryId.ANNOYANCES,
    label: 'Annoyances',
    enabled: true,
    subcategories: [
      { id: FilterSubcategoryId.POPUP_OVERLAYS, parentCategoryId: FilterCategoryId.ANNOYANCES, label: 'Popup Overlays', enabled: true },
      { id: FilterSubcategoryId.NEWSLETTER_NAGS, parentCategoryId: FilterCategoryId.ANNOYANCES, label: 'Newsletter Nags', enabled: true },
    ],
  },
];

interface FiltersState {
  categories: FilterCategory[];
}

const initialState: FiltersState = {
  categories: INITIAL_CATEGORIES,
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    toggleCategory(state, action: PayloadAction<FilterCategoryId>) {
      const cat = state.categories.find(c => c.id === action.payload);
      if (cat) {
        cat.enabled = !cat.enabled;
      }
    },
    toggleSubcategory(
      state,
      action: PayloadAction<{ categoryId: FilterCategoryId; subcategoryId: FilterSubcategoryId }>
    ) {
      const { categoryId, subcategoryId } = action.payload;
      const cat = state.categories.find(c => c.id === categoryId);
      if (cat) {
        const sub = cat.subcategories.find(s => s.id === subcategoryId);
        if (sub) {
          sub.enabled = !sub.enabled;
        }
      }
    },
    setCategoryEnabled(
      state,
      action: PayloadAction<{ id: FilterCategoryId; enabled: boolean }>
    ) {
      const cat = state.categories.find(c => c.id === action.payload.id);
      if (cat) {
        cat.enabled = action.payload.enabled;
      }
    },
  },
});

export const { toggleCategory, toggleSubcategory, setCategoryEnabled } = filterSlice.actions;
export default filterSlice.reducer;
