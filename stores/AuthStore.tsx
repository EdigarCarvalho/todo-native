import React, { createContext, useReducer, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "../services/ApiService";

// State type
type State = {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
};

// Initial state
const initialState: State = {
  isAuthenticated: false,
  token: null,
  isLoading: false,
  error: null,
};

// Define action types
const SET_LOADING = "SET_LOADING";
const SET_AUTH_SUCCESS = "SET_AUTH_SUCCESS";
const SET_AUTH_ERROR = "SET_AUTH_ERROR";
const LOGOUT = "LOGOUT";
const LOAD_TOKEN = "LOAD_TOKEN";

// Context type
const AuthContext = createContext<{
  state: State;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}>({
  state: initialState,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
});

// Reducer
const authReducer = (
  state: State,
  action: { type: string; payload?: any }
) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };
    case SET_AUTH_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload,
        isLoading: false,
        error: null,
      };
    case SET_AUTH_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        isLoading: false,
        error: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        error: null,
      };
    case LOAD_TOKEN:
      return {
        ...state,
        isAuthenticated: !!action.payload,
        token: action.payload,
      };
    default:
      return state;
  }
};

// Storage key
const TOKEN_KEY = "auth_token";

// Provider component
export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load token on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          apiService.setAuthToken(token);
          dispatch({ type: LOAD_TOKEN, payload: token });
        }
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };

    loadToken();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: SET_LOADING, payload: true });

    try {
      
        // console.log("Attempting to login with email:", email);
        
        const result = await apiService.login({ email, password });



      if (result.success && result.data?.token) {
        const token = result.data.token;
        
        // Save token to storage
        await AsyncStorage.setItem(TOKEN_KEY, token);
        
        // Set token in API service
        apiService.setAuthToken(token);
        
        // Update state
        dispatch({ type: SET_AUTH_SUCCESS, payload: token });
        
        return true;
      } else {
        dispatch({ type: SET_AUTH_ERROR, payload: result.error || "Login failed" });
        return false;
      }
    } catch (error) {
      dispatch({ type: SET_AUTH_ERROR, payload: "Network error" });
      return false;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    dispatch({ type: SET_LOADING, payload: true });

    try {
      const result = await apiService.register({ name, email, password });

      if (result.success) {
        // After successful registration, automatically login
        return await login(email, password);
      } else {
        dispatch({ type: SET_AUTH_ERROR, payload: result.error || "Registration failed" });
        return false;
      }
    } catch (error) {
      dispatch({ type: SET_AUTH_ERROR, payload: "Network error" });
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Remove token from storage
      await AsyncStorage.removeItem(TOKEN_KEY);
      
      // Clear token from API service
      apiService.setAuthToken("");
      
      // Update state
      dispatch({ type: LOGOUT });
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth
export const useAuth = () => {
  return useContext(AuthContext);
};
