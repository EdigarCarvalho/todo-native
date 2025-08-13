import React, { createContext, useReducer, useContext, useEffect } from "react";
import textsData from "../constants/Texts.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService, { RNFile } from "../services/ApiService";
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
const DELETE_TEXT = "DELETE_TEXT";
const UPDATE_TEXT = "UPDATE_TEXT";
const ADD_TEXT = "ADD_TEXT";

// Context type with added operations
const TextsContext = createContext<{
  state: State;
  fetchTexts: () => Promise<void>;
  setTextInFocus: (text: Text | null) => void;
  createText: (textData: { title: string; subtitle: string; content: string; cover?: RNFile }) => Promise<boolean>;
  updateText: (id: number, textData: { title: string; subtitle: string; content: string; cover?: RNFile }) => Promise<boolean>;
  deleteText: (id: number) => Promise<boolean>;
}>({
  state: initialState,
  fetchTexts: async () => {},
  setTextInFocus: () => {},
  createText: async () => false,
  updateText: async () => false,
  deleteText: async () => false,
});

// Updated reducer with new action types
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
    case DELETE_TEXT:
      return {
        ...state,
        texts: state.texts.filter(text => text.id !== action.payload),
        textInFocus: state.textInFocus?.id === action.payload ? null : state.textInFocus
      };
    case UPDATE_TEXT:
      return {
        ...state,
        texts: state.texts.map(text => 
          text.id === action.payload.id ? action.payload : text
        ),
        textInFocus: state.textInFocus?.id === action.payload.id ? action.payload : state.textInFocus
      };
    case ADD_TEXT:
      return {
        ...state,
        texts: [...state.texts, action.payload]
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
        // console.log("Attempting to fetch texts from API...");
        data = await fetchFromApi();
      }
      
      // Step 2: If API failed or we shouldn't fetch today, try local storage
      if (!data) {
        // console.log("Falling back to stored texts data...");
        data = await loadDataFromStorage();
      }
      
      // Step 3: If local storage has no data, use bundled JSON
      if (!data) {
        // console.log("Using bundled JSON texts data...");
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

  // Create text function
  const createText = async (textData: { 
    title: string; 
    subtitle: string; 
    content: string; 
    cover?: RNFile 
  }): Promise<boolean> => {
    dispatch({ type: SET_LOADING, payload: true });
    
    try {
      const result = await apiService.createText(textData);
      
      if (result.success && result.data) {
        // Add the new text to state
        dispatch({ type: ADD_TEXT, payload: result.data });
        
        // Update storage
        const updatedTexts = [...state.texts, result.data];
        await saveDataToStorage(updatedTexts);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating text:", error);
      return false;
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  // Update text function
  const updateText = async (id: number, textData: {
    title: string;
    subtitle: string;
    content: string;
    cover?: RNFile;
  }): Promise<boolean> => {
    dispatch({ type: SET_LOADING, payload: true });
    
    try {
      const result = await apiService.updateText(id, textData);
      
      if (result.success && result.data) {
        // Update the text in state
        dispatch({ type: UPDATE_TEXT, payload: result.data });
        
        // Update storage
        const updatedTexts = state.texts.map(text => 
          text.id === id ? result.data : text
        );
        await saveDataToStorage(updatedTexts);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating text:", error);
      return false;
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  // Delete text function
  const deleteText = async (id: number): Promise<boolean> => {
    dispatch({ type: SET_LOADING, payload: true });
    
    try {
      const result = await apiService.deleteText(id);
      
      if (result.success) {
        // Remove the text from state
        dispatch({ type: DELETE_TEXT, payload: id });
        
        // Update storage
        const updatedTexts = state.texts.filter(text => text.id !== id);
        await saveDataToStorage(updatedTexts);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting text:", error);
      return false;
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  return (
    <TextsContext.Provider
      value={{
        state,
        fetchTexts,
        setTextInFocus,
        createText,
        updateText,
        deleteText,
      }}
    >
      {children}
    </TextsContext.Provider>
  );
};

export const useTexts = () => {
  return useContext(TextsContext);
};
