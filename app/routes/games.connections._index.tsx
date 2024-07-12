import { json } from "@remix-run/cloudflare";
import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, Form } from "@remix-run/react";
import Nav from "~/components/Nav";
import { GameListTable, GameListRow } from "~/components/GameListTable";
import { DateTime } from "luxon";

export const meta: MetaFunction = () => {
  return [
    { title: "Connections" },
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};

export const loader: LoaderFunction = async ({ context, request }) => {
  // Get the params...
  const url = new URL(request.url);
  const spage = url.searchParams.get("page") ?? "0";
  let page = Number(spage);
  if (!page || page < 0) {
    page = 0;
  }
  const count = 20; // TODO - Get from query params?

  const now = DateTime.now().toISODate();

  // Load data from the database...
  const data = context.cloudflare.env.DB.prepare(
    `
      SELECT id
      FROM connections_games
      WHERE id < ?
      ORDER BY id DESC
      LIMIT ?
      OFFSET ?;
    `,
  )
    .bind(now, page, count)
    .all();

  return json({ data });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <header>
        <Nav />
      </header>
      <Form method="post" action="/games/connections">
        <button type="submit">Run</button>
      </Form>
      <main className="pt-8">
        <div className="max-w-5xl mx-auto px-4">
          <GameListTable>
            <GameListRow status="not-started" date="2024-07-06" />
            <GameListRow status="incomplete" date="2024-07-05" />
            <GameListRow status="win" date="2024-07-04" />
            <GameListRow status="not-started" date="2024-07-03" />
            <GameListRow status="loss" date="2024-07-02" />
          </GameListTable>
        </div>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </main>
    </>
  );
}
