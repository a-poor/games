import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Nav from "~/components/Nav";
import { GameListTable, GameListRow } from "~/components/GameListTable";
import { DateTime } from "luxon";
import { FIRST_GAME, parseState } from "~/lib/connections";
import { useEffect, useState } from "react";
import { getGamesDB, CONN_STATE_STORE_NAME } from "~/lib/data";

const COUNT_PER_PAGE = 20;

export const meta: MetaFunction = () => {
  return [
    { title: "Connections" },
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
    games.push(date);
    d = d.minus({ days: 1 });
  }

  const dtotal = DateTime.fromISO(FIRST_GAME).diffNow("days").days * -1;
  const total = Math.floor(dtotal);

  return json({
    page,
    total,
    games,
  });
};

type GameStatus = ReturnType<typeof parseState>;

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const [games, setGames] = useState(
    data.games.map((d) => ({ date: d, status: "not-started" as GameStatus }))
  );
  useEffect(() => {
    const upperKey = games[0].date;
    const lowerKey = games[games.length - 1].date;
    const range = IDBKeyRange.bound(lowerKey, upperKey);
    getGamesDB()
      .then((db) => db.getAll(CONN_STATE_STORE_NAME, range))
      .then((states) => {
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
        setGames(newGames);
      });
  }, [games]);
  return (
    <>
      <header>
        <Nav />
      </header>
      <main className="pt-8">
        <div className="max-w-5xl mx-auto px-4">
          <GameListTable
            page={data.page}
            count={data.games.length}
            total={data.total}
          >
            {games.map((g) => (
              <GameListRow key={g.date} date={g.date} status={g.status} />
            ))}
          </GameListTable>
        </div>
      </main>
    </>
  );
}
