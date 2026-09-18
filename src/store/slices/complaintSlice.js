import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchComplaints = createAsyncThunk('complaints/fetchComplaints', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/complaints', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaints');
  }
});

export const fetchComplaintById = createAsyncThunk('complaints/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch complaint detail');
  }
});

export const submitNewComplaint = createAsyncThunk('complaints/submit', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to submit complaint');
  }
});

export const submitVoiceComplaint = createAsyncThunk('complaints/voiceSubmit', async (voiceData, { rejectWithValue }) => {
  try {
    const response = await api.post('/complaints/voice', voiceData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to process voice complaint');
  }
});

export const assignWorkerToComplaint = createAsyncThunk('complaints/assignWorker', async ({ complaintId, workerId }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/complaints/${complaintId}/assign-worker`, { workerId });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to assign worker');
  }
});

export const updateComplaintStatus = createAsyncThunk('complaints/updateStatus', async ({ complaintId, status, remarks, image }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('status', status);
    if (remarks) formData.append('remarks', remarks);
    if (image) formData.append('image', image);

    const response = await api.put(`/complaints/${complaintId}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update complaint status');
  }
});

export const submitComplaintFeedback = createAsyncThunk('complaints/feedback', async ({ complaintId, rating, comments }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/complaints/${complaintId}/feedback`, { rating, comments });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to submit feedback');
  }
});

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    items: [],
    selectedComplaint: null,
    totalElements: 0,
    totalPages: 0,
    loading: false,
    error: null,
    submitSuccess: false,
  },
  reducers: {
    clearSelectedComplaint: (state) => {
      state.selectedComplaint = null;
    },
    resetSubmitState: (state) => {
      state.submitSuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Complaints
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.content || action.payload;
        state.totalElements = action.payload.totalElements || action.payload.length || 0;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By Id
      .addCase(fetchComplaintById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedComplaint = action.payload;
      })
      .addCase(fetchComplaintById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit
      .addCase(submitNewComplaint.pending, (state) => {
        state.loading = true;
        state.submitSuccess = false;
      })
      .addCase(submitNewComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.submitSuccess = true;
        state.items.unshift(action.payload);
      })
      .addCase(submitNewComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSelectedComplaint, resetSubmitState } = complaintSlice.actions;
export default complaintSlice.reducer;
