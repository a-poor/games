import type { APIEvent } from "@solidjs/start/server";
import { turso } from "~/lib/database";

export async function GET({ params }: APIEvent) {
  let id = params.id;
  if (!/20\d{2}-\d{2}-\d{2}/.test(id)) {
    return new Response("Not found\n", { status: 404 });
  }

  let res = await turso.execute({
    sql: `SELECT data FROM games WHERE id = ?;`,
    args: [id],
  });
  if (!res.rows) {
    return new Response("Not found\n", { status: 404 });
  }

  return new Response(String(res.rows[0].data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
