import { json } from "@remix-run/cloudflare";
import type {
  LoaderFunctionArgs,
  MetaFunction,
  TypedResponse,
} from "@remix-run/cloudflare";
import { ClientLoaderFunctionArgs, useLoaderData } from "@remix-run/react";
import Nav from "~/components/Nav";
import type { ConnGameData } from "~/lib/dtypes";
import Connections from "~/components/Connections";
import { FIRST_GAME } from "~/lib/connections";
import {
  getGamesDB,
  CONN_DATA_STORE_NAME,
  // CONN_STATE_STORE_NAME,
} from "~/lib/data";
// import { useEffect } from "react";

const fmtConnGameDataUrl = (d: string) =>
  `https://www.nytimes.com/svc/connections/v2/${d}.json`;

export const meta: MetaFunction = ({ params }) => {
  return [{ title: `Connections ${params.gid}` }];
};

export async function loader({
  context,
  params,
}: LoaderFunctionArgs): Promise<TypedResponse<ConnGameData>> {
  // Get and validate the parameter...
  const { gid } = params;
  if (!gid) {
    // Bad path
    console.error(`Bad path: ${gid}`);
    throw new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(gid)) {
    // Wrong format
    console.error(`Wrong format`);
    throw new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }
  if (gid < FIRST_GAME) {
    // Before first
    console.error(`Too far back`);
    throw new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }
  // if (gid > DateTime.now().toISODate()) {
  //   // In the future
  //   console.error(`In the future: ${gid}`);
  //   throw new Response(null, {
  //     status: 404,
  //     statusText: "Not found",
  //   });
  // }

  // Try to get that from the object store...
  const bucket = context.cloudflare.env.GAMES_BUCKET;
  const key = `/connections/${gid}.json`;
  const obj = await bucket.get(key);

  // If it exists, return it
  if (obj) {
    console.debug(gid + ": Found data in R2 bucket cache");
    return new Response(obj.body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  console.debug(gid + ": Didn't find data in R2 bucket cache. Pulling.");

  // Otherwise, try to fetch it
  const url = fmtConnGameDataUrl(gid);
  const data = await fetch(url)
    .then((d) => d.json())
    .catch((err) => {
      console.error("Error fetching data: " + err);
      throw new Response(null, {
        status: 404,
        statusText: "Not found",
      });
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((data as any)?.status?.toLowerCase() !== "ok") {
    console.error(
      "Response from NYT wasn't successful: " + JSON.stringify(data)
    );
    throw new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }
  const gameData = data as ConnGameData;

  // Add it to R2
  await bucket.put(key, JSON.stringify(gameData));
  return json(gameData, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export async function clientLoader({
  params,
  serverLoader,
}: ClientLoaderFunctionArgs) {
  // Get the game id param...
  const gameId = params.gid;
  if (!gameId) {
    return serverLoader<typeof loader>();
  }

  // Check if we have it in the store...
  const db = await getGamesDB();
  const gameData = await db.get(CONN_DATA_STORE_NAME, gameId);

  // If we have it, return it...
  if (gameData) {
    return gameData;
  }

  // Otherwise, fetch it...
  const data = await serverLoader<typeof loader>();

  // And store it...
  await db.put(CONN_DATA_STORE_NAME, data, gameId);

  // And return it...
  return data;
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  // useEffect(() => {
  //   getGamesDB()
  //     .then((db) => db.get(CONN_STATE_STORE_NAME, data.print_date))
  //     .then((d) => {});
  // });
  return (
    <>
      <header>
        <Nav />
      </header>
      <main>
        <Connections gameData={data} />
      </main>
    </>
  );
}
