import type { MetaFunction } from "@remix-run/cloudflare";
import Nav from "~/components/Nav";

export const meta: MetaFunction = () => {
  return [{ title: "Strands" }];
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
