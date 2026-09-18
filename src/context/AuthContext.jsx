import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser, logout, fetchCurrentUser } from '../store/slices/authSlice';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  const signIn = async (email, password) => {
    const res = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(res)) {
      return { error: null };
    }
    return { error: res.payload || 'Login failed' };
  };

  const signUp = async (registrationData) => {
    const res = await dispatch(registerUser(registrationData));
    if (registerUser.fulfilled.match(res)) {
      return { error: null };
    }
    return { error: res.payload || 'Registration failed' };
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API fallback:', err);
    } finally {
      dispatch(logout());
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  const refreshProfile = async () => {
    dispatch(fetchCurrentUser());
  };

  const value = {
    user,
    profile: user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
