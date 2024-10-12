import React, { createContext, useReducer, useContext } from "react";
import dict from "../constants/Words.json";

// Create a context for the dictionary
const DictionaryContext = createContext<{
  state: State;
  fetchWords: () => void;
  bookmarkWord: (word: any) => void;
  removeBookmark: (wordName: string) => void;
  setWordInFocus: (word: { word: string; meanings: string[] }) => void;
}>({
  state: {
    words: [],
    bookmarks: [],
    wordInFocus: {
      word: "",
      meanings: [""],
    },
  },
  fetchWords: () => {},
  bookmarkWord: () => {},
  removeBookmark: () => {},
  setWordInFocus: () => {},
});

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
};

// Initial state for the store
const initialState: State = {
  words: [],
  bookmarks: [],
  wordInFocus: {
    word: "",
    meanings: [],
  },
};

// Define action types
const FETCH_WORDS = "FETCH_WORDS";
const BOOKMARK_WORD = "BOOKMARK_WORD";
const REMOVE_BOOKMARK = "REMOVE_BOOKMARK";
const SET_WORD_IN_FOCUS = "SET_WORD_IN_FOCUS";

// Reducer function to manage state changes
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
        return state; // Word already bookmarked
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
    default:
      return state;
  }
};

// DictionaryProvider component to wrap the app and provide the store
export const DictionaryProvider = ({ children }: { children: any }) => {
  const [state, dispatch] = useReducer(dictionaryReducer, initialState);

  // Action to fetch words (this is mocked; replace with real API call)
  const fetchWords = () => {
    const fetchedWords = dict as { word: string; meanings: string[] }[];
    fetchedWords.sort((a, b) => a.word.localeCompare(b.word));
    dispatch({ type: FETCH_WORDS, payload: fetchedWords });
  };

  // Action to bookmark a word
  const bookmarkWord = (word: { word: string }) => {
    dispatch({ type: BOOKMARK_WORD, payload: word });
  };

  // Action to remove a bookmark
  const removeBookmark = (wordName: string) => {
    dispatch({ type: REMOVE_BOOKMARK, payload: wordName });
  };

  const setWordInFocus = (word: { word: string; meanings: string[] }) => {
    dispatch({ type: SET_WORD_IN_FOCUS, payload: word });
  };

  return (
    <DictionaryContext.Provider
      value={{
        state,
        fetchWords,
        bookmarkWord,
        removeBookmark,
        setWordInFocus,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
};

// Custom hook to use the DictionaryContext in components
export const useDictionary = () => {
  return useContext(DictionaryContext);
};
