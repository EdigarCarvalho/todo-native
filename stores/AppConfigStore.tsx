import React, { createContext, useReducer, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define app types
export type AppType = "user" | "admin";

// State type
type State = {
  appType: AppType;
  isLoading: boolean;
};

// Initial state - default to user mode
const initialState: State = {
  appType: "admin",
  isLoading: false,
};

// Define action types
const SET_APP_TYPE = "SET_APP_TYPE";
const SET_LOADING = "SET_LOADING";
const LOAD_STATE = "LOAD_STATE";

// Context type
const AppConfigContext = createContext<{
  state: State;
  setAppType: (appType: AppType) => Promise<void>;
  isAdmin: () => boolean;
}>({
  state: initialState,
  setAppType: async () => {},
  isAdmin: () => false,
});

// Reducer
const appConfigReducer = (
  state: State,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case SET_APP_TYPE:
      return {
        ...state,
        appType: action.payload,
      };
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case LOAD_STATE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

// Storage key
const STORAGE_KEY = "app_config";

// Provider component
export const AppConfigProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(appConfigReducer, initialState);

  // Load saved state on component mount
  useEffect(() => {
    const loadSavedConfig = async () => {
      try {
        dispatch({ type: SET_LOADING, payload: true });
        
        const savedConfig = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          dispatch({
            type: LOAD_STATE,
            payload: {
              appType: config.appType,
            },
          });
        }
      } catch (error) {
        console.error("Error loading app configuration:", error);
      } finally {
        dispatch({ type: SET_LOADING, payload: false });
      }
    };

    loadSavedConfig();
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

  // Helper function to check if app is in admin mode
  const isAdmin = () => {
    return state.appType === "admin";
  };

  return (
    <AppConfigContext.Provider
      value={{
        state,
        setAppType,
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
