import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const initialState = {
  rawData: [],
  dataSourceData: [],
  filteredData: [],
  status: 'idle',
  searchTerm: ''
};

export const loadData = createAsyncThunk(
  'datasource/loadData',
  async (arg, { getState, rejectWithValue }) => {
    const options = {
      method: 'GET'
    };
    try {
      const response = await fetch('./mindsdb_connectors.json', options);
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      return rejectWithValue('Error: Failed to load datasource data');
    }
  }
);

const filterBySearchTerm = (data, searchTerm) => {
  if (searchTerm === '') {
    return data;
  }
  return data.filter((item) => {
    const words = item.title.toLowerCase().split(' ');
    let lowerSearchTerm = searchTerm.toLowerCase();
    let match = false;
    for (let i in words) {
      if (words[i].startsWith(lowerSearchTerm)) {
        match = true;
        break;
      }
    }
    return match;
  });
};

// Remove items from data that do not have a title, since they will break filtering
const cleanData = (data) => {
  return data.filter((item) => {
    if (typeof item.title === 'undefined'
        || item.title === ''
        || !item.connection_args
        || !item.icon ) {
      return false;
    } 
    return true;
  });
};

export const datasourceSlice = createSlice({
  name: 'datasource',
  initialState,
  reducers: {
    updateSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filteredData = filterBySearchTerm(state.dataSourceData, action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadData.fulfilled, (state, action) => {
        state.status = 'idle';
        state.rawData = action.payload;
        const cleanedData = cleanData(action.payload);
        state.dataSourceData = cleanedData;
        state.filteredData = cleanedData;
      })
      .addCase(loadData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
    }
  });

export const getFilteredData = (state) => state.datasource.filteredData;
export const { updateSearchTerm } = datasourceSlice.actions;
export default datasourceSlice.reducer;
