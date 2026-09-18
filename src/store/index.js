import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import complaintReducer from './slices/complaintSlice';
import districtReducer from './slices/districtSlice';
import departmentReducer from './slices/departmentSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintReducer,
    districts: districtReducer,
    departments: departmentReducer,
    notifications: notificationReducer,
  },
});

export default store;
