import React, { createContext, useReducer, useContext, useEffect } from "react";
import wordsData from "../constants/Words.json";
import categoriesData from "../constants/Categories.json"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Updated state type without bookmarks
type State = {
  categories: Category[];
  wordsByCategory: Record<string, Word[]>;
  activeCategory: number;
  wordInFocus: Word | null;
  settings: {
    darkMode: boolean;
    fontSize: number;
  };
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
};

// Define action types (removed bookmark-related ones)
const FETCH_DATA = "FETCH_DATA";
const SET_ACTIVE_CATEGORY = "SET_ACTIVE_CATEGORY";
const SET_WORD_IN_FOCUS = "SET_WORD_IN_FOCUS";
const UPDATE_SETTINGS = "UPDATE_SETTINGS";
const LOAD_STATE = "LOAD_STATE";

// Updated context type
const DictionaryContext = createContext<{
  state: State;
  fetchData: () => void;
  setActiveCategory: (categoryId: number) => void;
  setWordInFocus: (word: Word | null) => void;
  updateSettings: (settings: Partial<State["settings"]>) => void;
}>({
  state: initialState,
  fetchData: () => {},
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
    default:
      return state;
  }
};

// Updated provider without bookmarks
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
        const savedSettings = await AsyncStorage.getItem("dictionary_settings");
        let settings = initialState.settings;
        if (savedSettings) {
          settings = JSON.parse(savedSettings);
        }

        dispatch({
          type: LOAD_STATE,
          payload: {
            settings,
          },
        });
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    };

    loadSavedState();
  }, []);

  const fetchData = () => {
    const categories = categoriesData as Category[];
    const wordsByCategory = wordsData as Record<string, Word[]>;
    
    dispatch({ 
      type: FETCH_DATA, 
      payload: { 
        categories,
        wordsByCategory 
      } 
    });
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