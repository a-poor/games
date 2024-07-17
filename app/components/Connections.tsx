import type { ConnGameData } from "~/lib/dtypes";
import { useConnGameState } from "~/lib/connections";

const MISTAKE_COUNT = 4;

export default function Connections({ gameData }: { gameData: ConnGameData }) {
  const [gameState, gameDispatch] = useConnGameState(gameData);
  return (
    <div className="grid grid-cols-1 max-w-xl mx-auto gap-4">
      <div className="grid grid-cols-4 grid-rows-4 gap-4">
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
        <div className="flex gap-1 items-center">
          {Array.from({
            length:
              MISTAKE_COUNT -
              gameState.guesses.filter((g) => !g.correct).length,
          }).map((_, i) => (
            <span key={i} className="bg-surface-700 size-4 rounded-full" />
          ))}
        </div>
      </div>
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
    "bg-yellow-500", // Yellow
    "bg-green-500", // Green
    "bg-sky-500", // Blue
    "bg-purple-500", // Purple
  ];
  const groupColorClass = groupColorClasses[groupId];
  return (
    <div className={"col-span-4 " + groupColorClass}>
      <h2>{groupName}</h2>
      <p>{words.join(", ")}</p>
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
      className={
        "h-32 w-32 rounded-lg select-none grid content-center text-lg font-semibold " +
        (selected
          ? "bg-surface-700 text-surface-50"
          : "bg-surface-300 text-surface-900")
      }
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
