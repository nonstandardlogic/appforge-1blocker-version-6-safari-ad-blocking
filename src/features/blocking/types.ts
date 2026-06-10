export interface BlockingRule {
  trigger: {
    'url-filter': string;
    'resource-type'?: string[];
    'if-domain'?: string[];
    'unless-domain'?: string[];
  };
  action: {
    type: 'block' | 'css-display-none' | 'ignore-previous-rules';
    selector?: string;
  };
}

export interface FilterList {
  id: string;
  name: string;
  category: 'ADS' | 'TRACKERS' | 'ANNOYANCES' | 'SOCIAL' | 'PRIVACY' | 'CUSTOM';
  enabled: boolean;
  rulesCount: number;
  lastUpdated: string;
}
