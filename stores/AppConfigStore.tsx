import React, { createContext, useReducer, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define app types
export type AppType = "user" | "admin";

// State type
type State = {
  appType: AppType;
  isLoading: boolean;
};

// Initial state - Set this to change the app type
const initialState: State = {
  appType: "admin", // CHANGE THIS VALUE TO SWITCH APP TYPES (user or admin)
  isLoading: true, // Start as loading to prevent premature redirects
};

// Storage key
const STORAGE_KEY = "app_config";

// Define action types
const SET_LOADING = "SET_LOADING";
const SET_APP_TYPE = "SET_APP_TYPE";
const RESET_STATE = "RESET_STATE";

// Context type
type AppConfigContextType = {
  state: State;
  setAppType: (appType: AppType) => Promise<void>;
  resetAppType: () => Promise<void>;
  forceAppType: (appType: AppType) => Promise<void>;
  isAdmin: () => boolean;
};

const AppConfigContext = createContext<AppConfigContextType>({
  state: initialState,
  setAppType: async () => {},
  resetAppType: async () => {},
  forceAppType: async () => {},
  isAdmin: () => false,
});

// Reducer
const appConfigReducer = (
  state: State,
  action: { type: string; payload: any }
): State => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case SET_APP_TYPE:
      return {
        ...state,
        appType: action.payload,
      };
    case RESET_STATE:
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
};

// Provider component
export const AppConfigProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(appConfigReducer, initialState);

  // Initialize state and load saved config
  useEffect(() => {
    const initializeConfig = async () => {
      try {
        dispatch({ type: SET_LOADING, payload: true });
        
        // For simplicity, let's just use the initial state value
        // and ignore any saved configuration
        const appType = initialState.appType;
        
        // Save this to storage to be consistent
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ appType }));
        
        // Set the app type
        dispatch({ type: SET_APP_TYPE, payload: appType });
        
        // console.log("App initialized with type:", appType);
      } catch (error) {
        console.error("Error initializing app configuration:", error);
      } finally {
        // Small delay to make sure UI is ready
        setTimeout(() => {
          dispatch({ type: SET_LOADING, payload: false });
        }, 300);
      }
    };

    initializeConfig();
  }, []);

  // Set app type and save to storage
  const setAppType = async (appType: AppType) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ appType }));
      
      // Update state
      dispatch({ type: SET_APP_TYPE, payload: appType });
    } catch (error) {
      console.error("Error saving app configuration:", error);
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  // Reset app type to initial state and clear storage
  const resetAppType = async () => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      
      // Remove from AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      // Reset state to initial
      dispatch({ type: RESET_STATE, payload: null });
    } catch (error) {
      console.error("Error resetting app configuration:", error);
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  // Force a specific app type (for testing purposes)
  const forceAppType = async (appType: AppType) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      
      // Override storage with new type
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ appType }));
      
      // Update state immediately
      dispatch({ type: SET_APP_TYPE, payload: appType });
    } catch (error) {
      console.error("Error forcing app configuration:", error);
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  // Helper function to check if app is in admin mode
  const isAdmin = () => {
    return state.appType === "admin";
  };

  return (
    <AppConfigContext.Provider
      value={{
        state,
        setAppType,
        resetAppType,
        forceAppType,
        isAdmin,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
};

// Custom hook for using app config
export const useAppConfig = () => {
  return useContext(AppConfigContext);
};