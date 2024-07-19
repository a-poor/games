import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import Nav from "~/components/Nav";
import { GameListTable, GameListRow } from "~/components/GameListTable";
import { DateTime } from "luxon";
import { FIRST_GAME } from "~/lib/connections";

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

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <header>
        <Nav />
      </header>
      <main className="pt-8">
        <div className="max-w-5xl mx-auto px-4">
          <GameListTable
            page={data.page}
            count={COUNT_PER_PAGE}
            total={data.total}
          >
            {data.games.map((g) => (
              <GameListRow key={g} date={g} status="not-started" />
            ))}
          </GameListTable>
        </div>
      </main>
    </>
  );
}
