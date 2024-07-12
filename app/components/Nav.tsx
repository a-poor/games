import { Link } from "@remix-run/react";
import { PuzzlePieceIcon } from "@heroicons/react/24/solid";

export default function Nav() {
  return (
    <>
      <div className="max-w-5xl mx-auto px-2 flex items-center space-x-3">
        <Link to="/" className="flex items-center text-3xl">
          <PuzzlePieceIcon className="size-6" />
          <span>Games</span>
        </Link>
        <nav>
          <ul className="flex items-center pt-1.5 space-x-2">
            <li>
              <Link
                to="/games/connections"
                className="text-xl text-surface-600 hover:text-surface-900"
              >
                Connections
              </Link>
            </li>
            <li>
              <Link
                to="/games/strands"
                className="text-xl text-surface-600 hover:text-surface-900"
              >
                Strands
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
