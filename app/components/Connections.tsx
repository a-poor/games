import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import type { ConnGameData } from "~/lib/dtypes";
import { useConnGameState } from "~/lib/connections";

const MISTAKE_COUNT = 4;

const SHOW_ONE_AWAY_TIMEOUT = 5000;

/**
 *
 *
 * @todo Limit adjust card font size by word length
 */
export default function Connections({ gameData }: { gameData: ConnGameData }) {
  const [gameState, gameDispatch] = useConnGameState(gameData);
  const gameIsOver = gameState.guesses.length === 4;

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
      <div className="grid grid-cols-4 grid-rows-4 gap-4 ">
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
      {gameIsOver || !gameIsOver ? (
        <div className="flex justify-center gap-1">
          <button
            className="text-xl font-medium text-surface-950 border border-surface-800 rounded-full px-3 py-1"
            onClick={() => setShowResults(true)}
          >
            View Results
          </button>
          <button
            className="text-xl font-medium text-surface-950 border border-surface-800 rounded-full px-3 py-1"
            onClick={() => gameDispatch({ type: "RESET" })}
          >
            Reset
          </button>
          <button
            className="text-xl font-medium text-surface-950 disabled:text-surface-500 border border-surface-800 disabled:border-surface-500 rounded-full px-3 py-1"
            onClick={() => gameDispatch({ type: "SUBMIT_GUESS" })}
            disabled={gameState.cards.filter((c) => c.selected).length !== 4}
          >
            Submit
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
        <div className="absolute inset-0 bg-white/85 grid place-content-center">
          <Results guesses={gameState.guesses} />
        </div>
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
        "h-32 flex items-center rounded-lg text-center col-span-4 " +
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
  guesses,
}: {
  guesses: {
    words: { group: number }[];
  }[];
}) {
  const groupColorClasses = [
    "bg-yellow-400", // Yellow
    "bg-green-500", // Green
    "bg-sky-500", // Blue
    "bg-purple-500", // Purple
  ];
  return (
    <>
      <div></div>
      <div className="h-fit grid grid-cols-4 gap-1 max-w-xs w-fit mx-auto">
        {guesses
          .map((g) => g.words)
          .flat()
          .map((w, i) => (
            <div
              key={i}
              className={["size-8 rounded-lg", groupColorClasses[w.group]].join(
                " "
              )}
            />
          ))}
      </div>
      <div></div>
    </>
  );
}
