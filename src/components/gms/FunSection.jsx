import { useState } from "react";
import { Gamepad2, Tv2 } from "lucide-react";
import { Glass } from "@/components/ui/liquid-glass";
import WordleGame from "./WordleGame";
import VideoFeed from "./VideoFeed";

const TABS = [
  { id: "videos", label: "Videos", icon: Tv2 },
  { id: "wordle", label: "Wordle", icon: Gamepad2 },
];

export default function FunSection({ currentUser }) {
  const [tab, setTab] = useState("videos");

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Header */}
      <Glass className="h-14 flex items-center gap-4 px-5 border-b border-white/50 flex-shrink-0" variant="subtle">
        <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Fun Zone</span>
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                tab === t.id ? "bg-white/70 text-primary shadow-sm" : "text-muted-foreground hover:bg-white/40"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
        </div>
      </Glass>

      {tab === "videos" && <VideoFeed currentUser={currentUser} />}
      {tab === "wordle" && (
        <div className="flex-1 overflow-y-auto">
          <WordleGame />
        </div>
      )}
    </div>
  );
}