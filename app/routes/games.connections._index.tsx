import { json } from "@remix-run/cloudflare";
import type { MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import { GameListTable, GameListRow } from "~/components/GameListTable";
import { DateTime } from "luxon";
import { FIRST_GAME, parseState } from "~/lib/connections";
import type { ConnGameData } from "~/lib/dtypes";
import {
  getGamesDB,
  CONN_DATA_STORE_NAME,
  CONN_STATE_STORE_NAME,
} from "~/lib/data";
import { useEffect } from "react";

const COUNT_PER_PAGE = 20;

export const meta: MetaFunction = () => {
  return [{ title: "Connections" }];
};

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  const spage = params.get("page") || "1";
  const page = /^[1-9]+[0-9]?$/.test(spage) ? parseInt(spage, 10) : 1;

  let d = DateTime.now().minus({ days: COUNT_PER_PAGE * (page - 1) });
  const games = [];
  for (let i = 0; i < COUNT_PER_PAGE; i++) {
    const date = d.toISODate();
    if (date < FIRST_GAME) {
      break;
    }
    games.push({
      date,
      status: "not-started" as GameStatus,
    });
    d = d.minus({ days: 1 });
  }

  const dtotal = DateTime.fromISO(FIRST_GAME).diffNow("days").days * -1;
  const total = Math.floor(dtotal);

  // Get the DB
  const db = await getGamesDB();

  // Get in the range of the page we're looking at
  const upperKey = games[0].date;
  const lowerKey = games[games.length - 1].date;
  const range = IDBKeyRange.bound(lowerKey, upperKey);
  const states = await db.getAll(CONN_STATE_STORE_NAME, range);

  const stateMap = new Map<string, GameStatus>(
    states.map((s) => [s.date, parseState(s)])
  );
  const newGames = games.map((g) => {
    const status = stateMap.get(g.date);
    return {
      date: g.date,
      status: status ?? ("not-started" as const),
    };
  });

  return json({
    page,
    total,
    games: newGames,
  });
};

type GameStatus = ReturnType<typeof parseState>;

export default function Index() {
  const data = useLoaderData<typeof clientLoader>();
  useEffect(() => {
    const games = data.games.map((g) => g.date);
    loadPageOfGameData(games);
  }, [data]);
  return (
    <>
      <main className="pt-8">
        <div className="max-w-5xl mx-auto px-4">
          <GameListTable
            page={data.page}
            count={data.games.length}
            total={data.total}
          >
            {data.games.map((g) => (
              <GameListRow key={g.date} date={g.date} status={g.status} />
            ))}
          </GameListTable>
        </div>
      </main>
    </>
  );
}

async function loadPageOfGameData(games: string[]) {
  // Get the database connection...
  const db = await getGamesDB();

  // For each of the games...
  Promise.allSettled(
    games.map(async (gid) => {
      // See if the game exists in the database...
      const data = await db.get(CONN_DATA_STORE_NAME, gid);

      // If it does, skip it...
      if (data) {
        return;
      }

      // Otherwise, fetch it...
      const res = await fetch(`/games/connections/${gid}.json`);

      // If the response wasn't successful, skip it...
      if (!res.ok) {
        console.error("Failed to load game data for", gid);
        return;
      }

      // Otherwise, store it...
      const gameData = (await res.json()) as ConnGameData;

      await db.put(CONN_DATA_STORE_NAME, gameData, gid);
    })
  );
}
