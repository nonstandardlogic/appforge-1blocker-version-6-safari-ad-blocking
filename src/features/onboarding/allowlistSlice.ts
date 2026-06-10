import {createAsyncThunk, createSlice, type PayloadAction} from '@reduxjs/toolkit';
import AllowlistModule from '../../native/modules/AllowlistModule';

export interface AllowlistEntry {
  id: string;
  domain: string;
  addedAt: string;
  source: 'USER' | 'SHARE_EXTENSION';
}

interface AllowlistState {
  entries: AllowlistEntry[];
  searchQuery: string;
}

const initialState: AllowlistState = {
  entries: [],
  searchQuery: '',
};

export const addToAllowlist = createAsyncThunk(
  'allowlist/addDomain',
  async ({domain, source}: {domain: string; source: AllowlistEntry['source']}) => {
    await AllowlistModule.addDomain(domain);
    const entry: AllowlistEntry = {
      id: `${Date.now()}-${domain}`,
      domain,
      addedAt: new Date().toISOString(),
      source,
    };
    return entry;
  },
);

const allowlistSlice = createSlice({
  name: 'allowlist',
  initialState,
  reducers: {
    addEntry(state, action: PayloadAction<AllowlistEntry>) {
      const exists = state.entries.some(e => e.domain === action.payload.domain);
      if (!exists) {
        state.entries.push(action.payload);
      }
    },
    removeEntry(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter(e => e.domain !== action.payload);
    },
    setEntries(state, action: PayloadAction<AllowlistEntry[]>) {
      state.entries = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(addToAllowlist.fulfilled, (state, action) => {
      const exists = state.entries.some(e => e.domain === action.payload.domain);
      if (!exists) {
        state.entries.push(action.payload);
      }
    });
  },
});

export const {addEntry, removeEntry, setEntries, setSearchQuery} =
  allowlistSlice.actions;
export default allowlistSlice.reducer;
