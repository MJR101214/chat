import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { getDisplayName } from "@/lib/useCurrentUser";
import UserAvatar from "../chat/UserAvatar";
import moment from "moment";

export default function ServerThreadPanel({ parentMessage, currentUser, onClose }) {
  const [replies, setReplies] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => { if (parentMessage) loadReplies(); }, [parentMessage?.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [replies]);

  const loadReplies = async () => {
    const data = await base44.entities.ServerMessage.filter({ thread_parent_id: parentMessage.id }, "created_date", 100);
    setReplies(data);
  };

  const send = async () => {
    if (!text.trim()) return;
    const msg = await base44.entities.ServerMessage.create({
      channel_id: parentMessage.channel_id,
      server_id: parentMessage.server_id,
      sender_email: currentUser.email,
      sender_display: getDisplayName(currentUser),
      content: text.trim(),
      thread_parent_id: parentMessage.id,
    });
    await base44.entities.ServerMessage.update(parentMessage.id, { thread_count: (parentMessage.thread_count || 0) + 1 });
    setReplies(p => [...p, msg]);
    setText("");
  };

  if (!parentMessage) return null;

  return (
    <div className="w-80 flex flex-col h-full border-l border-white/50 animate-slide-in-right" style={{ background: "rgba(255,255,255,0.30)", backdropFilter: "blur(20px)" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/50">
        <h3 className="font-semibold text-sm">Thread</h3>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7"><X className="h-4 w-4" /></Button>
      </div>

      {/* Parent */}
      <div className="px-4 py-3 border-b border-white/40 bg-white/20">
        <div className="flex gap-2">
          <UserAvatar name={parentMessage.sender_display} email={parentMessage.sender_email} size="xs" />
          <div>
            <span className="text-xs font-semibold">{parentMessage.sender_display}</span>
            <p className="text-xs text-foreground/80 mt-0.5">{parentMessage.content}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {replies.map(r => (
          <div key={r.id} className="flex gap-2 px-2 py-1.5 rounded-xl hover:bg-white/30 transition-colors">
            <UserAvatar name={r.sender_display} email={r.sender_email} size="xs" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold">{r.sender_display}</span>
                <span className="text-[9px] text-muted-foreground">{moment(r.created_date).format("h:mm A")}</span>
              </div>
              <p className="text-xs text-foreground/80 break-words">{r.content}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 pb-3 pt-1">
        <div className="flex items-center gap-2 rounded-xl p-2 border border-white/70" style={{ background: "rgba(255,255,255,0.5)" }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Reply..."
            className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground/60"
          />
          <Button onClick={send} disabled={!text.trim()} size="icon" className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 border-0 flex-shrink-0">
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}