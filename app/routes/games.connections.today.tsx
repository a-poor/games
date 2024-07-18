import { redirect } from "@remix-run/cloudflare";
import { DateTime } from "luxon";

export const loader = async () => {
  const today = DateTime.now().toISODate();
  return redirect(`/games/connections/${today}`);
};
