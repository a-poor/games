import { useParams } from "@solidjs/router";
import { createResource, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { clientOnly } from "@solidjs/start";
import type { ConnectionsResponse } from "~/lib/types";

export default function ConnectionsGameBoard() {
  const params = useParams();
  console.log(params);
  const [gameData] = createResource(async () => {
    const res = await fetch(
      `http://localhost:3000/api/games/connections/${params.gid}`,
    );
    return (await res.json()) as ConnectionsResponse;
  });
  return (
    <>
      <pre>{JSON.stringify(gameData(), null, 2)}</pre>
    </>
  );
}
