import { useReducer } from "react";
import type { ConnGameData } from "./dtypes";
import { useConnGameDBState, setConnGameDBState } from "./data";

export const FIRST_GAME = "2023-06-12";

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
    }
  | {
      type: "RESET";
    }
  | {
      type: "SET_STATE";
      state: ConnGameState;
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
        return (() => {
          if (cards.filter((c) => c.selected).length >= 4) {
            return state;
          }
          const newState = {
            ...state,
            cards: cards.map((c) => ({
              ...c,
              selected: c.word === action.word ? true : c.selected,
            })),
          };
          setConnGameDBState(gameData.print_date, newState);
          return newState;
        })();

      case "DESELECT_WORD":
        return (() => {
          const newState = {
            groups,
            guesses,
            cards: cards.map((c) => ({
              ...c,
              selected: c.word === action.word ? false : c.selected,
            })),
          };
          setConnGameDBState(gameData.print_date, newState);
          return newState;
        })();

      case "DESELECT_ALL":
        return (() => {
          const newState = {
            ...state,
            cards: state.cards.map((c) => ({
              ...c,
              selected: false,
            })),
          };
          setConnGameDBState(gameData.print_date, newState);
          return newState;
        })();

      case "SHUFFLE":
        return (() => {
          const oldCards = structuredClone(state.cards);
          const newCards = [];
          while (oldCards.length > 0) {
            const ri = Math.floor(Math.random() * oldCards.length);
            newCards.push(oldCards[ri]);
            oldCards.splice(ri, 1);
          }
          const newState = {
            ...state,
            cards: newCards,
          };
          setConnGameDBState(gameData.print_date, newState);
          return newState;
        })();

      case "SUBMIT_GUESS":
        return (() => {
          // Get the selected words
          const selectedWords = cards.filter((c) => c.selected);

          // Are enough selected?
          if (selectedWords.length < 4) {
            return state;
          }

          // Get the groups of the selected words
          const groups = selectedWords
            .map((c) => c.group)
            .reduce(
              (acc, g) => (acc.indexOf(g) === -1 ? [...acc, g] : acc),
              [] as number[]
            );

          // More than one group?
          if (groups.length > 1) {
            const newState = {
              ...state,
              guesses: [
                ...state.guesses,
                {
                  correct: false,
                  words: selectedWords.map((c) => ({
                    word: c.word,
                    group: c.group,
                  })),
                },
              ],
            };
            setConnGameDBState(gameData.print_date, newState);
            return newState;
          }

          // Return the updated state with:
          // - The selected word cards removed
          // - The new correct guess set
          const newState = {
            ...state,
            guesses: [
              ...state.guesses,
              {
                correct: true,
                words: selectedWords.map((c) => ({
                  word: c.word,
                  group: c.group,
                })),
              },
            ],
            cards: state.cards.filter((c) => !c.selected),
          };
          setConnGameDBState(gameData.print_date, newState);
          return newState;
        })();
      case "RESET":
        return (() => {
          const newState = structuredClone(initialState);
          setConnGameDBState(gameData.print_date, newState);
          return newState;
        })();
      case "SET_STATE":
        return (() => {
          setConnGameDBState(gameData.print_date, action.state); // Necessary?
          return action.state;
        })();
    }
  }, structuredClone(initialState)) as unknown as ConnReducer;
};
