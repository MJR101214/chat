import { useState } from "react";
import { Megaphone, ChevronDown, ChevronRight, Settings, Volume2, Mic, MicOff } from "lucide-react";
import { Glass } from "@/components/ui/liquid-glass";
import { getDisplayName, getUsername } from "@/lib/useCurrentUser";
import UserAvatar from "../chat/UserAvatar";

const CATEGORY_ORDER = ["INFORMATION", "GENERAL", "SUBJECTS", "SOCIAL", "VOICE"];

function groupChannels(channels) {
  const groups = {};
  channels.forEach(ch => {
    const cat = ch.category || "GENERAL";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(ch);
  });
  return groups;
}

function VoiceChannel({ ch, active, onJoin, joined }) {
  return (
    <div className={`w-full rounded-xl transition-all ${active ? "bg-white/30" : ""}`}>
      <button
        onClick={() => onJoin(ch.id)}
        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all text-left group ${
          joined
            ? "bg-green-500/20 text-green-700 font-medium"
            : "text-muted-foreground hover:bg-white/30 hover:text-foreground"
        }`}
      >
        <Volume2 className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate flex-1">{ch.name}</span>
        {joined && <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">Live</span>}
      </button>
      {joined && (
        <div className="px-3 pb-1.5 flex items-center gap-2">
          <button className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center" title="Muted (simulated)">
            <MicOff className="h-3 w-3 text-white" />
          </button>
          <span className="text-[10px] text-muted-foreground">You're connected</span>
        </div>
      )}
    </div>
  );
}

export default function ServerSidebar({ server, channels, activeChannelId, onSelectChannel, currentUser, onOpenSettings, onOpenProfile }) {
  const STATUS_COLOR = { online: "bg-green-400", away: "bg-amber-400", mid_test: "bg-red-400", offline: "bg-gray-400" };
  const STATUS_LABEL = { online: "Online", away: "Away", mid_test: "Mid Test", offline: "Offline" };
  const [collapsed, setCollapsed] = useState({});
  const [joinedVoice, setJoinedVoice] = useState(null);

  const groups = groupChannels(channels);
  const cats = CATEGORY_ORDER.filter(c => groups[c]).concat(
    Object.keys(groups).filter(c => !CATEGORY_ORDER.includes(c))
  );

  const handleVoiceJoin = (id) => {
    setJoinedVoice(v => v === id ? null : id);
  };

  return (
    <Glass contentClassName="w-60 flex flex-col h-full border-r border-white/25 flex-shrink-0" variant="default">
      {/* Server header */}
      <div className="px-4 py-3.5 border-b border-white/20 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
          {server?.name?.[0] || "S"}
        </div>
        <span className="font-bold text-sm truncate" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>{server?.name}</span>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {cats.map(cat => (
          <div key={cat}>
            <button
              onClick={() => setCollapsed(p => ({ ...p, [cat]: !p[cat] }))}
              className="flex items-center gap-1 w-full px-1 py-1 text-[10px] font-semibold text-foreground/50 uppercase tracking-wider hover:text-foreground transition-colors"
            >
              {collapsed[cat] ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {cat === "VOICE" ? "🔊 " : ""}{cat}
            </button>
            {!collapsed[cat] && (
              <div className="space-y-0.5 mt-0.5">
                {(groups[cat] || []).sort((a, b) => a.order - b.order).map(ch => {
                  if (ch.type === "voice") {
                    return <VoiceChannel key={ch.id} ch={ch} joined={joinedVoice === ch.id} onJoin={handleVoiceJoin} />;
                  }
                  return (
                    <button
                      key={ch.id}
                      onClick={() => onSelectChannel(ch.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all text-left group ${
                        activeChannelId === ch.id
                          ? "bg-white/40 text-foreground shadow-sm font-medium"
                          : "text-muted-foreground hover:bg-white/25 hover:text-foreground"
                      }`}
                    >
                      {ch.type === "announcement"
                        ? <Megaphone className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                        : <span className="text-xs opacity-40 font-mono">#</span>
                      }
                      <span className="truncate">{ch.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User section */}
      <div className="p-3 border-t border-white/20 flex items-center gap-2.5">
        <button onClick={onOpenProfile} className="relative">
          <UserAvatar name={getDisplayName(currentUser)} email={currentUser?.email} size="sm" />
          <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white/80 shadow-sm ${STATUS_COLOR[currentUser?.status] || "bg-gray-400"}`} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>{getDisplayName(currentUser)}</p>
          <p className="text-[10px] text-muted-foreground truncate">{STATUS_LABEL[currentUser?.status] || "Offline"}</p>
        </div>
        <button onClick={onOpenSettings} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/40 transition-colors">
          <Settings className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </Glass>
  );
}