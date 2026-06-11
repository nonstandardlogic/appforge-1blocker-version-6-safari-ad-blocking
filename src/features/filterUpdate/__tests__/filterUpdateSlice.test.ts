import reducer, {
  checkForUpdate,
  updateManifestReceived,
  noUpdateAvailable,
  checksumFailed,
  applyUpdate,
  updateApplied,
  updateFailed,
} from '../filterUpdateSlice';
import { FilterUpdateManifest, FilterUpdateState } from '../types';

const initial: FilterUpdateState = {
  status: 'idle',
  currentVersion: null,
  pendingManifest: null,
  lastCheckedAt: null,
  lastAppliedVersion: null,
  error: null,
  checksumValid: null,
};

const manifest: FilterUpdateManifest = {
  version: '2.0.0',
  deltaUrl: 'https://cdn.example.com/delta',
  fullUrl: 'https://cdn.example.com/full',
  checksum: 'abc123',
  isDelta: true,
};

describe('filterUpdateSlice', () => {
  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initial);
  });

  it('checkForUpdate sets status to checking', () => {
    const state = reducer(initial, checkForUpdate());
    expect(state.status).toBe('checking');
    expect(state.error).toBeNull();
  });

  it('updateManifestReceived sets status to downloading and stores manifest', () => {
    const state = reducer({ ...initial, status: 'checking' }, updateManifestReceived(manifest));
    expect(state.status).toBe('downloading');
    expect(state.pendingManifest).toEqual(manifest);
  });

  it('noUpdateAvailable sets status to up_to_date', () => {
    const state = reducer({ ...initial, status: 'checking' }, noUpdateAvailable());
    expect(state.status).toBe('up_to_date');
  });

  it('checksumFailed sets error, clears pendingManifest, preserves lastAppliedVersion', () => {
    const prevState: FilterUpdateState = {
      ...initial,
      status: 'downloading',
      pendingManifest: manifest,
      lastAppliedVersion: '1.0.0',
    };
    const state = reducer(prevState, checksumFailed());
    expect(state.status).toBe('error');
    expect(state.pendingManifest).toBeNull();
    expect(state.checksumValid).toBe(false);
    expect(state.lastAppliedVersion).toBe('1.0.0');
  });

  it('applyUpdate sets status to applying and marks checksum valid', () => {
    const state = reducer({ ...initial, status: 'downloading' }, applyUpdate());
    expect(state.status).toBe('applying');
    expect(state.checksumValid).toBe(true);
  });

  it('updateApplied sets status to idle and updates lastAppliedVersion', () => {
    const state = reducer({ ...initial, status: 'applying', pendingManifest: manifest }, updateApplied('2.0.0'));
    expect(state.status).toBe('idle');
    expect(state.lastAppliedVersion).toBe('2.0.0');
    expect(state.pendingManifest).toBeNull();
    expect(state.error).toBeNull();
  });

  it('updateFailed sets status to error with message', () => {
    const state = reducer({ ...initial, status: 'applying' }, updateFailed('Network error'));
    expect(state.status).toBe('error');
    expect(state.error).toBe('Network error');
  });
});
