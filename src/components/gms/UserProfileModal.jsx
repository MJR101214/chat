import { useState, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { getDisplayName, getUsername } from "@/lib/useCurrentUser";
import UserAvatar from "../chat/UserAvatar";

const STATUS_COLOR = {
  online: "bg-green-400",
  away: "bg-amber-400",
  mid_test: "bg-red-400",
  offline: "bg-gray-400",
};

const STATUS_LABEL = {
  online: "Online",
  away: "Away",
  mid_test: "Mid Test 🧪",
  offline: "Offline",
};

export default function UserProfileModal({ user, currentUser, onClose, onStartDm }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.ServerMessage.filter({ sender_email: user.email }, "-created_date", 5).then(setMessages);
  }, [user?.email]);

  if (!user) return null;

  const isOwn = user.email === currentUser?.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-pop"
        style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(32px) saturate(180%)", border: "1px solid rgba(255,255,255,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-blue-400 to-cyan-400 relative">
          <button onClick={onClose} className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/30 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar + info */}
        <div className="px-5 pb-5">
          <div className="flex items-end gap-3 -mt-8 mb-3">
            <div className="relative">
              <UserAvatar name={getDisplayName(user)} email={user.email} size="xl" className="ring-4 ring-white/60 shadow-lg" />
              <span className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white ${STATUS_COLOR[user.status] || "bg-gray-300"}`} />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="font-bold text-lg leading-tight truncate">{getDisplayName(user)}</h2>
              <p className="text-sm text-muted-foreground">@{getUsername(user)}</p>
            </div>
            {!isOwn && (
              <Button size="sm" onClick={() => { onStartDm(user.email); onClose(); }}
                className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white border-0 shadow-sm h-8 rounded-xl">
                <MessageCircle className="h-3.5 w-3.5 mr-1" /> DM
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[user.status] || "bg-gray-300"}`} />
              <span className="text-sm font-medium">{STATUS_LABEL[user.status] || "Offline"}</span>
            </div>

            {user.bio && (
              <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.3)" }}>
                <p className="text-xs font-semibold text-foreground/50 mb-1 uppercase tracking-wide">About</p>
                <p className="text-sm text-foreground/80">{user.bio}</p>
              </div>
            )}

            {messages.length > 0 && (
              <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.3)" }}>
                <p className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wide">Recent Messages</p>
                <div className="space-y-1.5">
                  {messages.slice(0, 3).map(m => (
                    <p key={m.id} className="text-xs text-foreground/70 line-clamp-1">"{m.content}"</p>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center">
              Member since {new Date(user.created_date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}