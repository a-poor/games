import type { MetaFunction } from "@remix-run/cloudflare";
import Nav from "~/components/Nav";
import GameListTable from "~/components/GameListTable";

export const meta: MetaFunction = () => {
  return [
    { title: "Connections" },
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};

export default function Index() {
  return (
    <>
      <header>
        <Nav />
      </header>
      <main>
        <div className="max-w-5xl mx-auto">
          <GameListTable />
        </div>
      </main>
    </>
  );
}
