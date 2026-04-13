import { MessageCircle, Tv2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "servers", icon: Users, label: "Servers" },
  { id: "dms", icon: MessageCircle, label: "Messages" },
  { id: "fun", icon: Tv2, label: "Fun" },
];

export default function AppSidebar({ activeTab, onChangeTab, servers, activeServerId, onSelectServer }) {
  return (
    <div className="w-16 flex flex-col items-center py-3 gap-2 border-r border-white/50 flex-shrink-0" style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(20px)" }}>
      {/* Logo */}
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md mb-1">
        <span className="text-white font-black text-xs">GMS</span>
      </div>
      <div className="w-8 h-px bg-white/50 mb-1" />

      {/* Server icons */}
      {servers.map(s => (
        <button
          key={s.id}
          onClick={() => { onSelectServer(s.id); onChangeTab("servers"); }}
          title={s.name}
          className={cn(
            "h-10 w-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-sm transition-all hover:scale-105",
            activeServerId === s.id && activeTab === "servers"
              ? "bg-gradient-to-br from-blue-500 to-cyan-400 shadow-md scale-105"
              : "bg-gradient-to-br from-blue-300 to-cyan-300 opacity-70 hover:opacity-100"
          )}
        >
          {s.name?.[0]?.toUpperCase()}
        </button>
      ))}

      <div className="w-8 h-px bg-white/50 my-1" />

      {/* Nav tabs */}
      {TABS.filter(t => t.id !== "servers").map(t => (
        <button
          key={t.id}
          onClick={() => onChangeTab(t.id)}
          title={t.label}
          className={cn(
            "h-10 w-10 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-105",
            activeTab === t.id
              ? "bg-white/70 shadow-sm text-primary"
              : "text-muted-foreground hover:bg-white/40"
          )}
        >
          <t.icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}