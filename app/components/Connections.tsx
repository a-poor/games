import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import type { ConnGameData } from "~/lib/dtypes";
import { useConnGameState } from "~/lib/connections";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { DocumentDuplicateIcon } from "@heroicons/react/20/solid";
import { getGamesDB, CONN_STATE_STORE_NAME } from "~/lib/data";

const MISTAKE_COUNT = 4;

const SHOW_ONE_AWAY_TIMEOUT = 5000;

export default function Connections({ gameData }: { gameData: ConnGameData }) {
  const [loaded, setLoaded] = useState(false);
  const [gameState, gameDispatch] = useConnGameState(gameData);
  useEffect(() => {
    if (loaded) return;
    getGamesDB()
      .then((db) => db.get(CONN_STATE_STORE_NAME, gameData.print_date))
      .then((data) => {
        if (data) {
          console.log("Setting game state from DB...");
          gameDispatch({ type: "SET_STATE", state: data });
        }
        setLoaded(true);
      });
  });

  const lostGame = gameState.guesses.filter((g) => !g.correct).length === 4;
  const wonGame = gameState.guesses.filter((g) => g.correct).length === 4;
  const gameIsOver = wonGame || lostGame;

  const [showResults, setShowResults] = useState(false);

  const [isOneAway, setIsOneAway] = useState(false);
  useEffect(() => {
    console.log("Checking one away...");

    // No guesses? Stop here.
    if (gameState.guesses.length === 0) return;

    // Get the number of groups
    const lastGuess = gameState.guesses[gameState.guesses.length - 1];
    const groups = lastGuess.words
      .map((w) => w.group)
      .reduce(
        (acc, g) => ({ ...acc, [g]: acc[g] ? acc[g] + 1 : 1 }),
        {} as Record<number, number>
      );
    console.log(groups);

    // If there aren't two groups (3+1) then stop here.
    const counts = Object.values(groups).toSorted();
    if (counts.length !== 2) return;

    // If there are two groups, check that they are 3 and 1
    if (counts[0] !== 1 || counts[1] !== 3) return;
    console.log("One away!");

    // If we're here, then we're one away.
    setIsOneAway(true);
    const timeout = setTimeout(
      () => setIsOneAway(false),
      SHOW_ONE_AWAY_TIMEOUT
    );
    return () => clearTimeout(timeout);
  }, [gameState.guesses]);

  useEffect(() => {
    // Only run if the game is over
    if (!gameIsOver) return;

    // Show the results page
    setShowResults(true);
  }, [gameIsOver]);

  return (
    <div className="grid grid-cols-1 max-w-xl w-fit mx-auto gap-4 relative">
      <div className="text-center text-xl">
        {DateTime.fromISO(gameData.print_date).toLocaleString({
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </div>
      <div className="text-center font-semibold h-6">
        {isOneAway && <span>One away!</span>}
      </div>
      <div className="grid grid-cols-4 grid-rows-4 gap-4 sm:min-w-[560px]">
        {/* The found groups... */}
        {gameState.guesses
          .filter((g) => g.correct)
          .map((g, i) => {
            const groupId = g.words[0].group;
            const group = gameData.categories[groupId];
            return (
              <ConnGroup
                key={i}
                groupName={group.title}
                groupId={groupId}
                words={group.cards.map((c) => c.content)}
              />
            );
          })}

        {/* The remaining cards... */}
        {gameState.cards.map((c, i) => (
          <ConnWord
            key={i}
            word={c.word}
            selected={c.selected}
            onSelect={() => {
              if (c.selected) {
                gameDispatch({ type: "DESELECT_WORD", word: c.word });
              } else {
                gameDispatch({ type: "SELECT_WORD", word: c.word });
              }
            }}
          />
        ))}
      </div>
      <div className="flex justify-center gap-2 py-4">
        <div>
          Mistakes remaining:{" "}
          <span className="sr-only">
            {MISTAKE_COUNT - gameState.guesses.filter((g) => !g.correct).length}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1 items-center">
          {Array.from({
            length:
              MISTAKE_COUNT -
              gameState.guesses.filter((g) => !g.correct).length,
          }).map((_, i) => (
            <span key={i} className="bg-surface-700 size-4 rounded-full" />
          ))}
        </div>
      </div>
      {gameIsOver ? (
        <div className="flex justify-center gap-1">
          <button
            className="text-xl font-medium text-surface-950 border border-surface-800 rounded-full px-3 py-1"
            onClick={() => gameDispatch({ type: "RESET" })}
          >
            Reset
          </button>
          <button
            className="text-xl font-medium text-surface-950 border border-surface-800 rounded-full px-3 py-1"
            onClick={() => setShowResults(true)}
          >
            View Results
          </button>
        </div>
      ) : (
        <div className="flex justify-center gap-1">
          <button
            className="text-xl font-medium text-surface-950 border border-surface-800 rounded-full px-3 py-1"
            onClick={() => gameDispatch({ type: "SHUFFLE" })}
          >
            Shuffle
          </button>
          <button
            className="text-xl font-medium text-surface-950 disabled:text-surface-500 border border-surface-800 disabled:border-surface-500 rounded-full px-3 py-1"
            onClick={() => gameDispatch({ type: "DESELECT_ALL" })}
            disabled={gameState.cards.filter((c) => c.selected).length === 0}
          >
            Deselect
          </button>
          <button
            className="text-xl font-medium text-surface-950 disabled:text-surface-500 border border-surface-800 disabled:border-surface-500 rounded-full px-3 py-1"
            onClick={() => gameDispatch({ type: "SUBMIT_GUESS" })}
            disabled={gameState.cards.filter((c) => c.selected).length !== 4}
          >
            Submit
          </button>
        </div>
      )}

      {showResults && (
        <>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
          <div
            className="fixed inset-0 transition bg-white/50 backdrop-blur grid"
            onClick={() => showResults && setShowResults(false)}
          >
            <Results
              guesses={gameState.guesses}
              gameNumber={gameData.id}
              onClose={() => setShowResults(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

function ConnGroup({
  groupName,
  words,
  groupId,
}: {
  groupName: string;
  words: string[];
  groupId: number;
}) {
  const groupColorClasses = [
    "bg-yellow-400", // Yellow
    "bg-green-500", // Green
    "bg-sky-500", // Blue
    "bg-purple-500", // Purple
  ];
  const groupColorClass = groupColorClasses[groupId];
  return (
    <div
      className={
        "h-32 w-full flex items-center rounded-lg text-center col-span-4 " +
        groupColorClass
      }
    >
      <div className="w-full">
        <h2 className="text-xl font-semibold">{groupName}</h2>
        <p className="text-lg">{words.join(", ")}</p>
      </div>
    </div>
  );
}

function ConnWord({
  word,
  selected,
  onSelect,
}: {
  word: string;
  selected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <label
      htmlFor={`word-${word}`}
      className={[
        "size-20 sm:size-32 rounded-lg select-none grid content-center font-medium sm:font-semibold text-xs tracking-tighter",
        selected
          ? "bg-surface-700 text-surface-50"
          : "bg-surface-300 text-surface-900",
        word.length < 6 ? "sm:text-2xl sm:tracking-normal" : null,
        word.length >= 6 && word.length < 10
          ? "sm:text-lg sm:tracking-tight"
          : null,
        word.length >= 10 ? "sm:text-sm sm:tracking-tight" : null,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        id={`word-${word}`}
        className="hidden"
        type="checkbox"
        name={word}
        checked={selected}
        onChange={onSelect}
      />
      <span className="block w-full text-center text-wrap break-all hyphens-auto px-[0.5]">
        {word}
      </span>
    </label>
  );
}

function Results({
  gameNumber,
  guesses,
  onClose,
}: {
  gameNumber: number;
  guesses: {
    words: { group: number }[];
  }[];
  onClose?: () => void;
}) {
  useEffect(() => {
    const callback = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    const eventType = "keyup";
    document.addEventListener(eventType, callback);
    return () => document.removeEventListener(eventType, callback);
  });

  const groupColorClasses = [
    "bg-yellow-400", // Yellow
    "bg-green-500", // Green
    "bg-sky-500", // Blue
    "bg-purple-500", // Purple
  ];
  const groupEmojis = ["🟨", "🟩", "🟦", "🟪"];

  const onCopy = () => {
    const guessLines = guesses.map((g) =>
      g.words.map((w) => groupEmojis[w.group]).join("")
    );
    const shareText = [
      "Connections",
      `Puzzle #${gameNumber}`,
      ...guessLines,
    ].join("\n");
    navigator.clipboard.writeText(shareText).catch(console.error);
  };

  const guessWords = guesses
    .map((g) => g.words)
    .flat()
    .map((w) => w.group);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="place-self-center bg-surface-50 rounded-lg px-4 pt-4 pb-12 min-w-72 flex flex-col gap-8"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-end">
        <button onClick={onClose}>
          <XMarkIcon className="stroke-surface-950 size-6" />
          <span className="sr-only">Close Results</span>
        </button>
      </div>
      <div className="text-center text-lg font-medium">
        Connections #{gameNumber}
      </div>
      <div className="h-fit grid grid-cols-4 gap-1 max-w-xs w-fit mx-auto">
        {guessWords.map((g, i) => (
          <div
            key={i}
            className={["size-8 rounded-lg", groupColorClasses[g]].join(" ")}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <button
          onClick={onCopy}
          className="bg-surface-950 rounded-full flex items-center gap-1 text-lg text-surface-50 px-3 py-2"
        >
          <DocumentDuplicateIcon className="size-5 fill-surface-50" />
          <span>Copy Results</span>
        </button>
      </div>
    </div>
  );
}
