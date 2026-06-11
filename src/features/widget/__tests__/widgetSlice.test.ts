import reducer, {
  updateWidgetData,
  setWidgetSize,
  MIN_UPDATE_INTERVAL_MINUTES,
  AVAILABLE_SIZES,
  WidgetState,
  WidgetData,
} from '../widgetSlice';

const initial: WidgetState = {
  data: null,
  availableSizes: ['small', 'medium', 'large'],
  selectedSize: 'medium',
  deepLinkDestination: 'statistics',
  updateIntervalMinutes: 15,
};

const sampleData: WidgetData = {
  todayBlocked: 142,
  topBlockedDomain: 'doubleclick.net',
  weeklyTrend: [100, 120, 95, 130, 110, 142, 88],
  lastUpdatedAt: '2026-06-11T01:00:00Z',
};

describe('widgetSlice', () => {
  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('MIN_UPDATE_INTERVAL_MINUTES is 15', () => {
    expect(MIN_UPDATE_INTERVAL_MINUTES).toBe(15);
  });

  it('AVAILABLE_SIZES contains small, medium, large', () => {
    expect(AVAILABLE_SIZES).toEqual(['small', 'medium', 'large']);
  });

  it('updateWidgetData stores widget data', () => {
    const state = reducer(initial, updateWidgetData(sampleData));
    expect(state.data).toEqual(sampleData);
  });

  it('updateWidgetData overwrites previous data', () => {
    let state = reducer(initial, updateWidgetData(sampleData));
    const newData: WidgetData = { ...sampleData, todayBlocked: 200 };
    state = reducer(state, updateWidgetData(newData));
    expect(state.data?.todayBlocked).toBe(200);
  });

  it('setWidgetSize updates selectedSize', () => {
    const state = reducer(initial, setWidgetSize('large'));
    expect(state.selectedSize).toBe('large');
  });

  it('setWidgetSize to small works', () => {
    const state = reducer(initial, setWidgetSize('small'));
    expect(state.selectedSize).toBe('small');
  });

  it('deepLinkDestination is always statistics', () => {
    const state = reducer(initial, setWidgetSize('large'));
    expect(state.deepLinkDestination).toBe('statistics');
  });

  it('availableSizes does not change on updates', () => {
    const state = reducer(initial, updateWidgetData(sampleData));
    expect(state.availableSizes).toEqual(['small', 'medium', 'large']);
  });
});
