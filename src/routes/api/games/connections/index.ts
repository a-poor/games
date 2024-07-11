import { turso } from "~/lib/database";

export async function GET() {
  let res = await turso.execute(`
    SELECT id
    FROM games
    ORDER BY id DESC;
  `);
  return new Response(
    JSON.stringify({
      gameIds: res.rows.map((r) => r.id),
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
