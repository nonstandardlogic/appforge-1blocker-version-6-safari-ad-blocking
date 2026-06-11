export enum FilterCategoryId {
  ADS = 'ADS',
  TRACKERS = 'TRACKERS',
  SOCIAL_WIDGETS = 'SOCIAL_WIDGETS',
  COOKIE_NOTICES = 'COOKIE_NOTICES',
  ANNOYANCES = 'ANNOYANCES',
}

export enum FilterSubcategoryId {
  BANNER_ADS = 'BANNER_ADS',
  VIDEO_ADS = 'VIDEO_ADS',
  SPONSORED_LINKS = 'SPONSORED_LINKS',
  ANALYTICS = 'ANALYTICS',
  CROSS_SITE_TRACKERS = 'CROSS_SITE_TRACKERS',
  FINGERPRINTING = 'FINGERPRINTING',
  SOCIAL_BUTTONS = 'SOCIAL_BUTTONS',
  COMMENT_WIDGETS = 'COMMENT_WIDGETS',
  COOKIE_CONSENT_BANNERS = 'COOKIE_CONSENT_BANNERS',
  GDPR_NOTICES = 'GDPR_NOTICES',
  POPUP_OVERLAYS = 'POPUP_OVERLAYS',
  NEWSLETTER_NAGS = 'NEWSLETTER_NAGS',
}

export interface FilterSubcategory {
  id: FilterSubcategoryId;
  parentCategoryId: FilterCategoryId;
  label: string;
  enabled: boolean;
}

export interface FilterCategory {
  id: FilterCategoryId;
  label: string;
  enabled: boolean;
  subcategories: FilterSubcategory[];
}

export interface CustomRule {
  id: string;
  pattern: string;
  enabled: boolean;
  createdAt: string;
}
