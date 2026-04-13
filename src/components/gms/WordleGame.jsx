import { useState, useEffect, useCallback } from "react";

const WORDS = ["APPLE","BRAVE","CLOUD","DANCE","EARLY","FLAME","GRACE","HEART","INDEX","JUICE","KNIFE","LIGHT","MAGIC","NIGHT","OCEAN","PEACE","QUEST","RIVER","SMILE","TIGER","ULTRA","VIVID","WATER","XEROX","YIELD","ZEBRA","BLAST","CHARM","DREAM","ELITE","FRESH","GLOOM","HAPPY","IRONY","JOKER","KARMA","LEMON","MOUNT","NEXUS","ORBIT","PIANO","QUIRK","RADAR","SWIFT","TOAST","UMBRA","VENUS","WINDY","XENON","YACHT"];

const getWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

const KEYS = [["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["ENTER","Z","X","C","V","B","N","M","⌫"]];

/**
 * @param {string} guess
 * @param {string} answer
 * @param {number} i
 * @returns {string}
 */
function getTileColor(guess, answer, i) {
  if (!guess) return "bg-white/40 border-white/60";
  const g = guess[i], a = answer;
  if (g === a[i]) return "bg-green-400 border-green-400 text-white";
  if (a.includes(g)) return "bg-amber-400 border-amber-400 text-white";
  return "bg-gray-300/70 border-gray-300/70 text-gray-600";
}

/**
 * @param {string} letter
 * @param {string[]} guesses
 * @param {string} answer
 * @returns {string}
 */
function getKeyColor(letter, guesses, answer) {
  let color = "bg-white/60 border-white/70 text-foreground";
  for (const g of guesses) {
    for (let i = 0; i < g.length; i++) {
      if (g[i] === letter) {
        if (answer[i] === letter) { color = "bg-green-400 border-green-400 text-white"; break; }
        else if (answer.includes(letter)) color = "bg-amber-400 border-amber-400 text-white";
        else color = "bg-gray-300/70 border-gray-300/70 text-gray-500";
      }
    }
  }
  return color;
}

export default function WordleGame() {
  const [answer, setAnswer] = useState(getWord);
  const [guesses, setGuesses] = useState(/** @type {string[]} */ ([]));
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState("playing"); // playing | won | lost
  const [shake, setShake] = useState(false);

  const submit = useCallback(() => {
    if (current.length !== 5) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    const newGuesses = [...guesses, current];
    setGuesses(newGuesses);
    setCurrent("");
    if (current === answer) setStatus("won");
    else if (newGuesses.length >= 6) setStatus("lost");
  }, [current, guesses, answer]);

  const pressKey = useCallback((/** @type {string} */ k) => {
    if (status !== "playing") return;
    if (k === "⌫" || k === "BACKSPACE") setCurrent(p => p.slice(0, -1));
    else if (k === "ENTER") submit();
    else if (current.length < 5 && /^[A-Z]$/.test(k)) setCurrent(p => p + k);
  }, [status, current, submit]);

  useEffect(() => {
    const handler = (/** @type {KeyboardEvent} */ e) => pressKey(e.key.toUpperCase());
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pressKey]);

  const reset = () => { setAnswer(getWord()); setGuesses([]); setCurrent(""); setStatus("playing"); };

  const displayGuesses = [...guesses, ...(status === "playing" ? [current] : []), ...Array(Math.max(0, 6 - guesses.length - (status === "playing" ? 1 : 0))).fill("")];

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-center">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Wordle</h2>
        <p className="text-xs text-muted-foreground">Guess the 5-letter word in 6 tries</p>
      </div>

      {/* Grid */}
      <div className={`grid gap-1.5 ${shake ? "animate-[wiggle_0.3s_ease]" : ""}`} style={{ gridTemplateRows: "repeat(6, 1fr)" }}>
        {displayGuesses.slice(0, 6).map((guess, row) => (
          <div key={row} className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, col) => {
              const letter = guess[col] || "";
              const isSubmitted = row < guesses.length;
              return (
                <div key={col}
                  className={`h-12 w-12 flex items-center justify-center rounded-xl border-2 font-bold text-lg transition-all duration-300
                    ${isSubmitted ? getTileColor(guess, answer, col) : letter ? "border-primary/40 bg-white/60" : "bg-white/30 border-white/50"}`}
                  style={{ transitionDelay: isSubmitted ? `${col * 60}ms` : "0ms" }}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {status !== "playing" && (
        <div className={`text-center py-2 px-4 rounded-2xl ${status === "won" ? "bg-green-100/80 text-green-700" : "bg-red-100/80 text-red-700"}`}>
          <p className="font-bold text-sm">{status === "won" ? "🎉 You got it!" : `The word was: ${answer}`}</p>
          <button onClick={reset} className="text-xs underline mt-0.5">Play again</button>
        </div>
      )}

      {/* Keyboard */}
      <div className="space-y-1.5">
        {KEYS.map((row, i) => (
          <div key={i} className="flex gap-1 justify-center">
            {row.map(k => (
              <button key={k} onClick={() => pressKey(k)}
                className={`h-10 min-w-8 px-1 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95
                  ${k === "ENTER" ? "min-w-14 text-[10px] bg-primary text-primary-foreground border-primary/50" : getKeyColor(k, guesses, answer)}`}
              >
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}