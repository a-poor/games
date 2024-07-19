import type { JSX } from "react";
import { Link } from "@remix-run/react";
import {
  XCircleIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  ArrowLongRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/solid";
import { DateTime } from "luxon";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import type { parseState } from "~/lib/connections";

export function GameListTable({
  page,
  count,
  total,
  children,
}: {
  page: number;
  count: number;
  total: number;
  children?: JSX.Element | JSX.Element[];
}) {
  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-surface-900">
            Connections
          </h1>
          <p className="mt-2 text-sm text-surface-700">
            A list of all the users in your account including their name, title,
            email and role.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="/games/connections/today"
            className="rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center space-x-1"
          >
            <span>Latest</span>
            <ArrowLongRightIcon className="size-5" />
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-surface-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-surface-900 sm:pl-0"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-surface-900"
                  >
                    Date
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">{children}</tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>
                    <GameListPagination
                      page={page}
                      count={count}
                      total={total}
                    />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameListRow({
  date,
  status,
}: {
  date: string;
  status: ReturnType<typeof parseState>;
}) {
  const fmtDate = DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL);
  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-surface-900 sm:pl-0">
        {status === "not-started" && (
          <>
            <EmptyCircleIncon className="size-6 fill-surface-500" />
            <span className="sr-only">Not Started</span>
          </>
        )}
        {status === "in-progress" && (
          <>
            <MinusCircleIcon className="size-6 fill-amber-400" />
            <span className="sr-only">Incomplete</span>
          </>
        )}
        {status === "won" && (
          <>
            <CheckCircleIcon className="size-6 fill-green-500" />
            <span className="sr-only">Win</span>
          </>
        )}
        {status === "lost" && (
          <>
            <XCircleIcon className="size-6 fill-rose-500" />
            <span className="sr-only">Loss</span>
          </>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-surface-500">
        <Link
          to={`/games/connections/${date}`}
          className="text-indigo-600 hover:text-indigo-900"
          prefetch="render"
        >
          {fmtDate}
        </Link>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
        {false && <DropDownMenu date={date} />}
      </td>
    </tr>
  );
}

function EmptyCircleIncon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DropDownMenu({ date }: { date: string }) {
  return (
    <>
      <Menu>
        <MenuButton>
          <EllipsisHorizontalIcon className="size-5" />
          <span className="sr-only">Open Action Menu for {date}</span>
        </MenuButton>
        <MenuItems anchor="bottom">
          <MenuItem>
            <a className="block data-[focus]:bg-blue-100" href="/settings">
              Settings
            </a>
          </MenuItem>
          <MenuItem>
            <a className="block data-[focus]:bg-blue-100" href="/support">
              Support
            </a>
          </MenuItem>
          <MenuItem>
            <a className="block data-[focus]:bg-blue-100" href="/license">
              License
            </a>
          </MenuItem>
        </MenuItems>
      </Menu>
    </>
  );
}

export function GameListPagination({
  page,
  count,
  total,
}: {
  page: number;
  count: number;
  total: number;
}) {
  const countPerPage = 20;
  const nfirst = (page - 1) * countPerPage + 1;
  const nlast = nfirst + count - 1;
  return (
    <nav
      className="flex items-center justify-between border-t border-surface-200 bg-white px-4 py-3 sm:px-6"
      aria-label="Pagination"
    >
      <div className="hidden sm:block">
        <p className="text-sm text-surface-700">
          <span>Showing </span>
          <span className="font-medium">{nfirst}</span>
          <span> to </span>
          <span className="font-medium">{nlast}</span>
          <span> of </span>
          <span className="font-medium">{total}</span>
          <span> results</span>
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        {page <= 1 ? (
          <span className="relative inline-flex items-center rounded-md bg-surface-100 px-3 py-2 text-sm font-semibold text-surface-500 ring-1 ring-inset ring-surface-300">
            Previous
          </span>
        ) : (
          <Link
            to={`/games/connections?page=${page - 1}`}
            className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-surface-900 ring-1 ring-inset ring-surface-300 hover:bg-surface-50 focus-visible:outline-offset-0"
          >
            Previous
          </Link>
        )}
        <Link
          to={`/games/connections?page=${page + 1}`}
          className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-surface-900 ring-1 ring-inset ring-surface-300 hover:bg-surface-50 focus-visible:outline-offset-0"
        >
          Next
        </Link>
      </div>
    </nav>
  );
}
