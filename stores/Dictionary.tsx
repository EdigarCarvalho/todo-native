import React, { createContext, useReducer, useContext, useEffect } from "react";
import dict from "../constants/Words.json";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Add settings to state type
type State = {
  words: {
    word: string;
    meanings: string[];
  }[];
  bookmarks: {
    word: string;
    meanings: string[];
  }[];
  wordInFocus: {
    word: string;
    meanings: string[];
  };
  settings: {
    darkMode: boolean;
    fontSize: number;
  };
};

// Initial state
const initialState: State = {
  words: [],
  bookmarks: [],
  wordInFocus: {
    word: "",
    meanings: [],
  },
  settings: {
    darkMode: true,
    fontSize: 3,
  },
};

// Define action types
const FETCH_WORDS = "FETCH_WORDS";
const BOOKMARK_WORD = "BOOKMARK_WORD";
const REMOVE_BOOKMARK = "REMOVE_BOOKMARK";
const SET_WORD_IN_FOCUS = "SET_WORD_IN_FOCUS";
const UPDATE_SETTINGS = "UPDATE_SETTINGS";
const LOAD_STATE = "LOAD_STATE"; 

// Update context type
const DictionaryContext = createContext<{
  state: State;
  fetchWords: () => void;
  bookmarkWord: (word: any) => void;
  removeBookmark: (wordName: string) => void;
  setWordInFocus: (word: { word: string; meanings: string[] }) => void;
  updateSettings: (settings: Partial<State["settings"]>) => void;
}>({
  state: initialState,
  fetchWords: () => {},
  bookmarkWord: () => {},
  removeBookmark: () => {},
  setWordInFocus: () => {},
  updateSettings: () => {},
});

// Update reducer
const dictionaryReducer = (
  state: State,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case FETCH_WORDS:
      return {
        ...state,
        words: action.payload,
      };
    case BOOKMARK_WORD:
      if (state.bookmarks.find((word) => word.word === action.payload.word)) {
        return state;
      }

      const word = state.words.find(
        (word) => word.word === action.payload.word
      );

      const bookmarks = [...state.bookmarks, word!];
      bookmarks.sort((a, b) => a.word.localeCompare(b.word));

      return {
        ...state,
        bookmarks,
      };
    case REMOVE_BOOKMARK:
      return {
        ...state,
        bookmarks: state.bookmarks.filter(
          (word) => word.word !== action.payload
        ),
      };
    case SET_WORD_IN_FOCUS:
      return {
        ...state,
        wordInFocus: action.payload,
      };
    case UPDATE_SETTINGS:
      const newSettings = {
        ...state.settings,
        ...action.payload,
      };
      // Save settings to AsyncStorage
      AsyncStorage.setItem('dictionary_settings', JSON.stringify(newSettings));
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

// Updated provider with settings
export const DictionaryProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(dictionaryReducer, initialState);

  // Load saved state on component mount
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        // Load bookmarks
        const savedBookmarks = await AsyncStorage.getItem('dictionary_bookmarks');
        let bookmarks = [];
        if (savedBookmarks) {
          bookmarks = JSON.parse(savedBookmarks);
        }

        // Load settings
        const savedSettings = await AsyncStorage.getItem('dictionary_settings');
        let settings = initialState.settings;
        if (savedSettings) {
          settings = JSON.parse(savedSettings);
        }

        dispatch({ 
          type: LOAD_STATE, 
          payload: { 
            bookmarks, 
            settings 
          } 
        });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    };

    loadSavedState();
  }, []);

  // Save bookmarks whenever they change
  useEffect(() => {
    if (state.bookmarks.length > 0) {
      AsyncStorage.setItem('dictionary_bookmarks', JSON.stringify(state.bookmarks));
    }
  }, [state.bookmarks]);

  const fetchWords = () => {
    const fetchedWords = dict as { word: string; meanings: string[] }[];
    fetchedWords.sort((a, b) => a.word.localeCompare(b.word));
    dispatch({ type: FETCH_WORDS, payload: fetchedWords });
  };

  const bookmarkWord = (word: { word: string }) => {
    dispatch({ type: BOOKMARK_WORD, payload: word });
  };

  const removeBookmark = (wordName: string) => {
    dispatch({ type: REMOVE_BOOKMARK, payload: wordName });
  };

  const setWordInFocus = (word: { word: string; meanings: string[] }) => {
    dispatch({ type: SET_WORD_IN_FOCUS, payload: word });
  };

  // New function to update settings
  const updateSettings = (settings: Partial<State["settings"]>) => {
    dispatch({ type: UPDATE_SETTINGS, payload: settings });
  };

  return (
    <DictionaryContext.Provider
      value={{
        state,
        fetchWords,
        bookmarkWord,
        removeBookmark,
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