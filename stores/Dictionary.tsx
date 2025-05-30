import React, { createContext, useReducer, useContext, useEffect } from "react";
import wordsData from "../constants/Words.json";
import categoriesData from "../constants/Categories.json"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "http://localhost:3000"; // Replace with your actual API base URL  

// Define types based on your JSON structure
type Attachment = {
  id: number;
  source: string;
  url: string;
};

type Word = {
  id: number;
  word: string;
  meaning: string;
  attachments: Attachment[];
};

type Category = {
  id: number;
  name: string;
};

// Updated state type with API fetch tracking
type State = {
  categories: Category[];
  wordsByCategory: Record<string, Word[]>;
  activeCategory: number;
  wordInFocus: Word | null;
  settings: {
    darkMode: boolean;
    fontSize: number;
  };
  lastApiFetch: string | null;
  isLoading: boolean;
};

// Initial state
const initialState: State = {
  categories: [],
  wordsByCategory: {},
  activeCategory: 0,
  wordInFocus: null,
  settings: {
    darkMode: true,
    fontSize: 3,
  },
  lastApiFetch: null,
  isLoading: false,
};

// Define action types
const FETCH_DATA = "FETCH_DATA";
const SET_ACTIVE_CATEGORY = "SET_ACTIVE_CATEGORY";
const SET_WORD_IN_FOCUS = "SET_WORD_IN_FOCUS";
const UPDATE_SETTINGS = "UPDATE_SETTINGS";
const LOAD_STATE = "LOAD_STATE";
const SET_LOADING = "SET_LOADING";
const UPDATE_LAST_API_FETCH = "UPDATE_LAST_API_FETCH";

// Updated context type
const DictionaryContext = createContext<{
  state: State;
  fetchData: () => Promise<void>;
  setActiveCategory: (categoryId: number) => void;
  setWordInFocus: (word: Word | null) => void;
  updateSettings: (settings: Partial<State["settings"]>) => void;
}>({
  state: initialState,
  fetchData: async () => {},
  setActiveCategory: () => {},
  setWordInFocus: () => {},
  updateSettings: () => {},
});

// Updated reducer
const dictionaryReducer = (
  state: State,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case FETCH_DATA:
      return {
        ...state,
        categories: action.payload.categories,
        wordsByCategory: action.payload.wordsByCategory,
        activeCategory: action.payload.categories[0]?.id || 0
      };
    case SET_ACTIVE_CATEGORY:
      return {
        ...state,
        activeCategory: action.payload,
        wordInFocus: null
      };
    case SET_WORD_IN_FOCUS:
      return {
        ...state,
        wordInFocus: action.payload
      };
    case UPDATE_SETTINGS:
      const newSettings = {
        ...state.settings,
        ...action.payload,
      };
      // Save settings to AsyncStorage
      AsyncStorage.setItem("dictionary_settings", JSON.stringify(newSettings));
      return {
        ...state,
        settings: newSettings,
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
  SETTINGS: "dictionary_settings",
  CATEGORIES: "dictionary_categories",
  WORDS: "dictionary_words",
  LAST_FETCH: "dictionary_last_fetch",
};

// Updated provider with API and caching support
export const DictionaryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(dictionaryReducer, initialState);

  // Load saved state on component mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        // Load settings
        const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        let settings = initialState.settings;
        if (savedSettings) {
          settings = JSON.parse(savedSettings);
        }

        // Load last API fetch date
        const lastApiFetch = await AsyncStorage.getItem(STORAGE_KEYS.LAST_FETCH);

        dispatch({
          type: LOAD_STATE,
          payload: {
            settings,
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
    if (!state.lastApiFetch) return true;
    
    const lastFetch = new Date(state.lastApiFetch);
    const today = new Date();
    
    // Return true if the last fetch was not today
    return lastFetch.getDate() !== today.getDate() || 
           lastFetch.getMonth() !== today.getMonth() || 
           lastFetch.getFullYear() !== today.getFullYear();
  };

  // Save data to local storage
  const saveDataToStorage = async (categories: Category[], wordsByCategory: Record<string, Word[]>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      await AsyncStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(wordsByCategory));
      
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
      const savedCategories = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const savedWords = await AsyncStorage.getItem(STORAGE_KEYS.WORDS);
      
      if (savedCategories && savedWords) {
        return {
          categories: JSON.parse(savedCategories),
          wordsByCategory: JSON.parse(savedWords)
        };
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
      // Replace with your actual API endpoint
      const categoriesResponse = await fetch(BASE_URL + '/category/all');
      const wordsResponse = await fetch(BASE_URL + '/word/all');
      
      if (!categoriesResponse.ok || !wordsResponse.ok) {
        throw new Error('API response was not ok');
      }
      
      const categories = await categoriesResponse.json();
      const wordsByCategory = await wordsResponse.json();
      
      // Save successful API data to storage
      await saveDataToStorage(categories?.categories, wordsByCategory?.data);
      
      return { categories, wordsByCategory };
    } catch (error) {
      console.error("Error fetching from API:", error);
      return null;
    }
  };

  // Main fetch data function with fallback logic
  const fetchData = async () => {
    dispatch({ type: SET_LOADING, payload: true });
    
    try {
      let data = null;
      
      // Step 1: Try API if we should fetch today
      if (shouldFetchFromApi()) {
        console.log("Attempting to fetch from API...");
        data = await fetchFromApi();
      }
      
      // Step 2: If API failed or we shouldn't fetch today, try local storage
      if (!data) {
        console.log("Falling back to stored data...");
        data = await loadDataFromStorage();
      }
      
      // Step 3: If local storage has no data, use bundled JSON
      if (!data) {
        console.log("Using bundled JSON data...");
        data = {
          categories: categoriesData as Category[],
          wordsByCategory: wordsData as Record<string, Word[]>
        };
      }
      
      // Dispatch data to state
      dispatch({ 
        type: FETCH_DATA, 
        payload: data
      });
    } catch (error) {
      console.error("Error in fetchData:", error);
      
      // Last resort: use bundled JSON
      dispatch({ 
        type: FETCH_DATA, 
        payload: { 
          categories: categoriesData as Category[],
          wordsByCategory: wordsData as Record<string, Word[]>
        } 
      });
    } finally {
      dispatch({ type: SET_LOADING, payload: false });
    }
  };

  const setActiveCategory = (categoryId: number) => {
    dispatch({ type: SET_ACTIVE_CATEGORY, payload: categoryId });
  };

  const setWordInFocus = (word: Word | null) => {
    dispatch({ type: SET_WORD_IN_FOCUS, payload: word });
  };

  // Keep settings functionality
  const updateSettings = (settings: Partial<State["settings"]>) => {
    dispatch({ type: UPDATE_SETTINGS, payload: settings });
  };

  return (
    <DictionaryContext.Provider
      value={{
        state,
        fetchData,
        setActiveCategory,
        setWordInFocus,
        updateSettings,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => {
  return useContext(DictionaryContext);
};