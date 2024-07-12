import { A } from "@solidjs/router";
import type { Component } from "solid-js";

export default function Nav() {
  return (
    <div class="max-w-7xl mx-auto mt-2 px-1 sm:px-4 flex items-center space-x-4">
      <A href="/" class="flex items-center">
        <PuzzleIcon class="size-10 stroke-surface-950 dark:stroke-surface-50" />
        <span class="text-3xl font-medium text-surface-950 dark:text-surface-100">
          Games
        </span>
      </A>
      <nav class="text-xl pt-1.5">
        <ul class="flex space-x-3">
          <li>
            <A
              href="/connections"
              class="text-surface-600 hover:text-surface-950 dark:text-surface-400 dark:hover:text-surface-100"
              activeClass="underline decoration-1"
            >
              Connections
            </A>
          </li>
          <li>
            <A
              href="/strands"
              class="text-surface-600 hover:text-surface-950 dark:text-surface-400 dark:hover:text-surface-100"
              activeClass="underline decoration-1"
            >
              Strands
            </A>
          </li>
          <li>
            <A
              href="/about"
              class="text-surface-600 hover:text-surface-950 dark:text-surface-400 dark:hover:text-surface-100"
              activeClass="underline decoration-1"
            >
              About
            </A>
          </li>
        </ul>
      </nav>
    </div>
  );
}

const PuzzleIcon: Component<{ class?: string }> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class={props.class}
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z"
    />
  </svg>
);
