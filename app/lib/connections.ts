import { useReducer } from "react";
import type { ConnGameData } from "./dtypes";

export type ConnGameState = {
  groups: {
    group: number;
    name: string;
    words: string[];
  }[];
  cards: {
    word: string;
    selected: boolean;
    group: number;
  }[];
  guesses: {
    words: {
      word: string;
      group: number;
    }[];
    correct: boolean;
  }[];
};

export type ConnGameAction =
  | {
      type: "SELECT_WORD";
      word: string;
    }
  | {
      type: "DESELECT_WORD";
      word: string;
    }
  | {
      type: "DESELECT_ALL";
    }
  | {
      type: "SUBMIT_GUESS";
    }
  | {
      type: "SHUFFLE";
    };

export type ConnReducer = [
  ConnGameState,
  (action: ConnGameAction) => ConnGameState
];

export const useConnGameState = (gameData: ConnGameData) => {
  // Get the initial data
  const groups = gameData.categories.map((c, i) => ({
    name: c.title,
    group: i,
    found: false,
    words: c.cards.map((c) => c.content),
  }));

  type CardAndPos = ConnGameState["cards"][0] & { position: number };
  const pcards: CardAndPos[] = [];
  for (let i = 0; i < gameData.categories.length; i++) {
    const cat = gameData.categories[i];
    for (let j = 0; j < cat.cards.length; j++) {
      const card = cat.cards[j];
      pcards.push({
        word: card.content,
        group: i,
        selected: false,
        position: card.position,
      });
    }
  }
  pcards.sort((a, b) => a.position - b.position);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cards = pcards.map(({ position, ...rest }) => rest);
  const initialState = {
    groups,
    cards,
    guesses: [],
  } as ConnGameState;

  return useReducer((state: ConnGameState, action: ConnGameAction) => {
    const { groups, cards, guesses } = state;
    console.log("action", action);
    switch (action.type) {
      case "SELECT_WORD":
        if (cards.filter((c) => c.selected).length >= 4) {
          return state;
        }
        return {
          ...state,
          cards: cards.map((c) => ({
            ...c,
            selected: c.word === action.word ? true : c.selected,
          })),
        };

      case "DESELECT_WORD":
        return {
          groups,
          guesses,
          cards: cards.map((c) => ({
            ...c,
            selected: c.word === action.word ? false : c.selected,
          })),
        };

      case "DESELECT_ALL":
        return {
          ...state,
          cards: state.cards.map((c) => ({
            ...c,
            selected: false,
          })),
        };

      case "SHUFFLE":
        return (() => {
          const oldCards = [...state.cards];
          const newCards = [];
          for (let i = 0; i < state.cards.length; i++) {
            const ri = Math.floor(Math.random() * oldCards.length);
            newCards.push(oldCards[ri]);
            oldCards.splice(ri);
          }
          return {
            ...state,
            cards: newCards,
          };
        })();

      case "SUBMIT_GUESS":
        return (() => {
          const selectedWords = cards.filter((c) => c.selected);
          if (selectedWords.length < 4) {
            return state;
          }
          return state;
        })();
    }
  }, initialState) as unknown as ConnReducer;
};
