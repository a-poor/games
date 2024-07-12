import type { ReactElement } from "react";
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

export function GameListTable({
  children,
}: {
  children: ReactElement<typeof GameListRow>[];
}) {
  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Users
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users in your account including their name, title,
            email and role.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to={`/games/connections/${"2024-07-06"}`}
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
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Date
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">{children}</tbody>
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
  status: "not-started" | "incomplete" | "win" | "loss";
}) {
  const fmtDate = DateTime.fromISO(date).toLocaleString(DateTime.DATE_FULL);
  return (
    <tr>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
        {status === "not-started" && (
          <>
            <EmptyCircleIncon className="size-6 fill-gray-500" />
            <span className="sr-only">Not Started</span>
          </>
        )}
        {status === "incomplete" && (
          <>
            <MinusCircleIcon className="size-6 fill-amber-400" />
            <span className="sr-only">Incomplete</span>
          </>
        )}
        {status === "win" && (
          <>
            <CheckCircleIcon className="size-6 fill-green-500" />
            <span className="sr-only">Win</span>
          </>
        )}
        {status === "loss" && (
          <>
            <XCircleIcon className="size-6 fill-rose-500" />
            <span className="sr-only">Loss</span>
          </>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <Link
          to={`/games/connections/${date}`}
          className="text-indigo-600 hover:text-indigo-900"
        >
          {fmtDate}
        </Link>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
        <DropDownMenu date={date} />
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
