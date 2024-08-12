import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs, TypedResponse } from "@remix-run/cloudflare";
import type { ConnGameData } from "~/lib/dtypes";
import { FIRST_GAME } from "~/lib/connections";

const fmtConnGameDataUrl = (d: string) =>
  `https://www.nytimes.com/svc/connections/v2/${d}.json`;

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
