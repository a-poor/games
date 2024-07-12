import { useParams } from "@solidjs/router";
import { createResource, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { clientOnly } from "@solidjs/start";
import type { ConnectionsResponse } from "~/lib/types";

const GameBoard = clientOnly(
  () => import("../../components/ConnectionsGameBoard"),
);

type GameStoreData = {
  groups: {
    text: string;
    found: boolean;
  }[];
  cards: {
    word: string;
    group: string;
    selected: boolean;
  }[];
};

const createGameStore = (gameData: ConnectionsResponse) =>
  createStore<GameStoreData>({
    groups: [],
    cards: [],
  });

export default function Home() {
  return (
    <main class="">
      <Suspense fallback={<div>Loading...</div>}>
        <GameBoard />
      </Suspense>
    </main>
  );
}
