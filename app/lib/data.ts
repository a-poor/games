import { openDB } from "idb";
import type { IDBPDatabase, DBSchema } from "idb";
import type { ConnGameData } from "./dtypes";
import type { ConnGameState } from "./connections";
import { useAsync } from "./util";

export const GAMES_DB_NAME = "games";
export const GAMES_DB_VERSION = 1;
export const CONN_DATA_STORE_NAME = "connectionsData";
export const CONN_STATE_STORE_NAME = "connectionsState";

let db: IDBPDatabase<GameDBSchema> | null = null;

export interface GameDBSchema extends DBSchema {
  [CONN_DATA_STORE_NAME]: {
    key: string;
    value: ConnGameData;
  };

  [CONN_STATE_STORE_NAME]: {
    key: string;
    value: ConnGameState;
  };
}

export const getGamesDB = async () => {
  if (db) return db;
  db = await openDB<GameDBSchema>(GAMES_DB_NAME, GAMES_DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(CONN_DATA_STORE_NAME);
      db.createObjectStore(CONN_STATE_STORE_NAME);
    },
  });
  return db;
};

export const useConnGameDB = () => useAsync(getGamesDB)

export const useConnGameDBData = (gameId: string) => {
  return useAsync(async () => {
    const db = await getGamesDB();
    return db.get(CONN_DATA_STORE_NAME, gameId);
  });
};

export const useConnGameDBState = (gameId: string) => {
  return useAsync(async () => {
    const db = await getGamesDB();
    return db.get(CONN_STATE_STORE_NAME, gameId);
  });
};

export const setConnGameDBData = async (gameId: string, data: ConnGameData) => {
  const db = await getGamesDB();
  return db.put(CONN_DATA_STORE_NAME, data, gameId);
};

export const setConnGameDBState = async (
  gameId: string,
  state: ConnGameState
) => {
  const db = await getGamesDB();
  return db.put(CONN_STATE_STORE_NAME, state, gameId);
};
