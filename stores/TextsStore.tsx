import React, { createContext, useReducer, useContext, useEffect } from "react";
import textsData from "../constants/Texts.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "../services/ApiService";
import { useAppConfig } from "./AppConfigStore";

// Define type based on your JSON structure
type Text = {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  cover_url: string;
};

// State type with API fetch tracking
type State = {
  texts: Text[];
  textInFocus: Text | null;
  lastApiFetch: string | null;
  isLoading: boolean;
};

// Initial state
const initialState: State = {
  texts: [],
  textInFocus: null,
  lastApiFetch: null,
  isLoading: false,
};

// Define action types
const FETCH_TEXTS = "FETCH_TEXTS";
const SET_TEXT_IN_FOCUS = "SET_TEXT_IN_FOCUS";
const LOAD_STATE = "LOAD_STATE";
const SET_LOADING = "SET_LOADING";
const UPDATE_LAST_API_FETCH = "UPDATE_LAST_API_FETCH";

// Context type
const TextsContext = createContext<{
  state: State;
  fetchTexts: () => Promise<void>;
  setTextInFocus: (text: Text | null) => void;
}>({
  state: initialState,
  fetchTexts: async () => {},
  setTextInFocus: () => {},
});

// Reducer
const textsReducer = (
  state: State,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case FETCH_TEXTS:
      return {
        ...state,
        texts: action.payload,
      };
    case SET_TEXT_IN_FOCUS:
      return {
        ...state,
        textInFocus: action.payload
      };
    case LOAD_STATE:
      return {
        ...state,
        ...action.payload,
      };
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case UPDATE_LAST_API_FETCH:
      return {
        ...state,
        lastApiFetch: action.payload,
      };
    default:
      return state;
  }
};

// Storage keys
const STORAGE_KEYS = {
  TEXTS: "texts_data",
  LAST_FETCH: "texts_last_fetch",
};

// Provider with API and caching support
export const TextsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(textsReducer, initialState);
  const { isAdmin } = useAppConfig();

  // Load saved state on component mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        // Load last API fetch date
        const lastApiFetch = await AsyncStorage.getItem(STORAGE_KEYS.LAST_FETCH);

        dispatch({
          type: LOAD_STATE,
          payload: {
            lastApiFetch
          },
        });
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    };

    loadSavedState();
  }, []);

  // Check if we should try API fetch today
  const shouldFetchFromApi = () => {
    // Admin users can always fetch from API
    if (isAdmin()) return true;
    
    if (!state.lastApiFetch) return true;
    
    const lastFetch = new Date(state.lastApiFetch);
    const today = new Date();
    
    // Return true if the last fetch was not today
    return lastFetch.getDate() !== today.getDate() || 
           lastFetch.getMonth() !== today.getMonth() || 
           lastFetch.getFullYear() !== today.getFullYear();
  };

  // Save data to local storage
  const saveDataToStorage = async (texts: Text[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TEXTS, JSON.stringify(texts));
      
      // Update last fetch date
      const now = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_FETCH, now);
      dispatch({ type: UPDATE_LAST_API_FETCH, payload: now });
    } catch (error) {
      console.error("Error saving data to storage:", error);
    }
  };

  // Load data from local storage
  const loadDataFromStorage = async () => {
    try {
      const savedTexts = await AsyncStorage.getItem(STORAGE_KEYS.TEXTS);
      
      if (savedTexts) {
        return JSON.parse(savedTexts);
      }
      return null;
    } catch (error) {
      console.error("Error loading data from storage:", error);
      return null;
    }
  };

  // Attempt to fetch from API
  const fetchFromApi = async () => {
    try {
      // Use the API service
      const textsResult = await apiService.getTexts();

      console.log(textsResult);
      
      
      if (!textsResult.success && !((textsResult?.data?.data?.length || 0) > 0)) {
        throw new Error('API response was not ok');
      }
      
      const texts = textsResult?.data?.data || textsResult?.data || [];
      
      // Save successful API data to storage
      await saveDataToStorage(texts);
      
      return texts;
    } catch (error) {
      console.error("Error fetching from API:", error);
      return null;
    }
  };

  // Main fetch texts function with fallback logic
  const fetchTexts = async () => {
    dispatch({ type: SET_LOADING, payload: true });
    
    try {
      let data = null;
      
      // Step 1: Try API if we should fetch today
      if (shouldFetchFromApi()) {
        console.log("Attempting to fetch texts from API...");
        data = await fetchFromApi();
      }
      
      // Step 2: If API failed or we shouldn't fetch today, try local storage
      if (!data) {
        console.log("Falling back to stored texts data...");
        data = await loadDataFromStorage();
      }
      
      // Step 3: If local storage has no data, use bundled JSON
      if (!data) {
        console.log("Using bundled JSON texts data...");
        data = textsData;
      }
      
      // Dispatch data to state
      dispatch({ 
        type: FETCH_TEXTS, 
        payload: data
      });
    } catch (error) {
      console.error("Error in fetchTexts:", error);
      
      // Last resort: use bundled JSON
      dispatch({ 
        type: FETCH_TEXTS, 
        payload: textsData
      });
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  const setTextInFocus = (text: Text | null) => {
    dispatch({ type: SET_TEXT_IN_FOCUS, payload: text });
  };

  return (
    <TextsContext.Provider
      value={{
        state,
        fetchTexts,
        setTextInFocus,
      }}
    >
      {children}
    </TextsContext.Provider>
  );
};

export const useTexts = () => {
  return useContext(TextsContext);
};
