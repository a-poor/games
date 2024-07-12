import type { MetaFunction } from "@remix-run/cloudflare";
import Nav from "~/components/Nav";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
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
      <main></main>
    </>
  );
}
