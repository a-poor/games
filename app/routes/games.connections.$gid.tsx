import { json } from "@remix-run/cloudflare";
import type {
  LoaderFunctionArgs,
  MetaFunction,
  TypedResponse,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { DateTime } from "luxon";
import Nav from "~/components/Nav";
import { useConnGameState } from "~/lib/connections";
import type { ConnGameData } from "~/lib/dtypes";

const FIRST_GAME = "2023-06-12";

const fmtConnGameDataUrl = (d: string) =>
  `https://www.nytimes.com/svc/connections/v2/${d}.json`;

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
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
  if (gid > DateTime.now().toISODate()) {
    // In the future
    console.error(`In the future: ${gid}`);
    throw new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

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
  const data = await fetch(url).then((d) => d.json());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((data as any)?.status?.toLowerCase() !== "ok") {
    console.error(
      "Response from NYT wasn't successful: " + JSON.stringify(data),
    );
    throw new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }
  const gameData = data as ConnGameData;

  // Add it to R2
  await bucket.put(key, JSON.stringify(gameData));
  return json(gameData);
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const [gameState, gameDispatch] = useConnGameState(data);
  return (
    <>
      <header>
        <Nav />
      </header>
      <main>
        <button
          onClick={() => gameDispatch({ type: "SELECT_WORD", word: "GYM" })}
        >
          Gym
        </button>
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
      </main>
    </>
  );
}
