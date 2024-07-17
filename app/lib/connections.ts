import { useReducer } from "react";
import { ReducerState, ReducerAction, Dispatch } from "react";
import type { ConnGameData } from "./dtypes";

export type ConnGameState = {
  groups: {
    name: string;
    words: string[];
    group: number;
    foundOrder?: number;
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
  (action: ConnGameAction) => ConnGameState,
];

export const useConnGameState = (gameData: ConnGameData) =>
  useReducer(
    (state: ConnGameState, action: ConnGameAction) => {
      const { groups, cards, guesses } = state;
      switch (action.type) {
        case "SELECT_WORD":
          // If there are already 4 selected, do nothing
          if (state.cards.reduce((a, b) => a + Number(b.selected), 0) >= 4) {
            return { groups, cards, guesses };
          }

          // Set the (first) card with a matching word to selected
          for (let i = 0; i < cards.length; i++) {
            if (cards[i].word === action.word) {
              cards[i].selected = true;
              break;
            }
          }
          return { groups, cards, guesses };

        case "DESELECT_WORD":
          return {
            groups,
            guesses,
            cards: cards.map((c) => ({
              ...c,
              selected: c.word === action.word ? false : c.word,
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
          return state;
      }
    },
    gameData,
    (gameData) => {
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
      return {
        groups,
        cards,
        guesses: [],
      } as ConnGameState;
    },
  ) as any as ConnReducer;
