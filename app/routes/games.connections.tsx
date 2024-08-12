import { Outlet } from "@remix-run/react";
import Nav from "~/components/Nav";

export default function Index() {
  return (
    <>
      <header>
        <Nav />
      </header>
      <Outlet />
    </>
  );
}
