import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...state, user: null, token: null, loading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    default:
      return state;
  }
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptors
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          dispatch({ type: 'LOGOUT' });
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [state.token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (state.token) {
        try {
          const response = await api.get(`/api/auth/me`);
          if (response.data.success) {
            dispatch({ type: 'SET_USER', payload: response.data.data.user });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, [state.token]);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post(`/api/auth/login`, {
        email,
        password,
      });

      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.data.user,
            token: response.data.data.token,
          },
        });
        toast.success('Login successful!');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error?.message || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post(`/api/auth/register`, {
        username,
        email,
        password,
      });

      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.data.user,
            token: response.data.data.token,
          },
        });
        toast.success('Registration successful!');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.error?.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
