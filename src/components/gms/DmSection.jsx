import { useState, useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import { Plus, Search, Send, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { getDisplayName, getUsername } from "@/lib/useCurrentUser";
import UserAvatar from "../chat/UserAvatar";
import moment from "moment";

const STATUS_COLOR = {
  online: "bg-green-400",
  away: "bg-amber-400",
  mid_test: "bg-red-400",
  offline: "bg-gray-400",
};

const STATUS_LABEL = { online: "Online", away: "Away", mid_test: "Mid Test", offline: "Offline" };

function StatusDot({ status }) {
  return (
    <span className={`inline-block h-2.5 w-2.5 rounded-full border-2 border-white/80 shadow-sm ${STATUS_COLOR[status] || "bg-gray-400"} flex-shrink-0`} title={STATUS_LABEL[status] || "Offline"} />
  );
}

function CallOverlay({ callee, onHangUp }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="glass rounded-3xl p-8 flex flex-col items-center gap-5 w-72 animate-pop">
        <UserAvatar name={callee} size="xl" />
        <div className="text-center">
          <p className="font-bold text-lg">{callee}</p>
          <p className="text-sm text-muted-foreground">{fmt}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onHangUp}
            className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all active:scale-95"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatPane({ convo, currentUser, allUsers }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [calling, setCalling] = useState(false);
  const bottomRef = useRef(null);

  const otherEmail = convo?.members?.find(m => m !== currentUser?.email);
  const otherUser = allUsers.find(u => u.email === otherEmail);
  const otherName = getDisplayName(otherUser) || otherEmail;

  useEffect(() => {
    if (!convo) return;
    loadMessages();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id !== convo.id || event.data?.thread_parent_id) return;
      if (event.type === "create") setMessages(p => [...p, event.data]);
      else if (event.type === "delete") setMessages(p => p.filter(m => m.id !== event.id));
    });
    return unsub;
  }, [convo?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadMessages = async () => {
    const data = await base44.entities.Message.filter({ conversation_id: convo.id }, "created_date", 200);
    setMessages(data.filter(m => !m.thread_parent_id));
  };

  const send = async () => {
    if (!text.trim()) return;
    await base44.entities.Message.create({
      conversation_id: convo.id,
      sender_email: currentUser.email,
      sender_name: getDisplayName(currentUser),
      content: text.trim(),
    });
    await base44.entities.Conversation.update(convo.id, { last_message_preview: text.trim().slice(0, 80), last_message_at: new Date().toISOString() });
    setText("");
  };

  if (!convo) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a conversation</div>;

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {calling && <CallOverlay callee={otherName} onHangUp={() => setCalling(false)} />}

      <div className="h-14 flex items-center gap-3 px-5 border-b border-white/50 flex-shrink-0" style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(16px)" }}>
        <UserAvatar name={otherName} email={otherEmail} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold">{otherName}</p>
            <StatusDot status={otherUser?.status} />
          </div>
          <p className="text-[10px] text-muted-foreground capitalize">{otherUser?.status || "offline"}</p>
        </div>
        <button
          onClick={() => setCalling(true)}
          className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all shadow-sm"
          title="Call"
        >
          <Phone className="h-4 w-4 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {messages.map(msg => {
          const isOwn = msg.sender_email === currentUser?.email;
          return (
            <div key={msg.id} className={`flex gap-2 px-2 py-1.5 rounded-xl hover:bg-white/30 transition-colors ${isOwn ? "flex-row-reverse" : ""}`}>
              {!isOwn && <UserAvatar name={msg.sender_name} email={msg.sender_email} size="xs" />}
              <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                {!isOwn && <span className="text-[10px] font-semibold text-foreground/70 mb-0.5">{msg.sender_name}</span>}
                <div className={`rounded-2xl px-3 py-2 text-sm ${isOwn ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white" : "bg-white/60 text-foreground"}`}>
                  {msg.content}
                </div>
                <span className="text-[9px] text-muted-foreground mt-0.5">{moment(msg.created_date).format("h:mm A")}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-2xl p-2 border border-white/70" style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
            placeholder={`Message ${otherName}...`}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none py-1.5"
          />
          <Button onClick={send} disabled={!text.trim()} size="icon" className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 border-0 flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DmSection({ currentUser, allUsers, onOpenProfile, onOpenSettings }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [newSearch, setNewSearch] = useState("");
  const [showNew, setShowNew] = useState(false);

  useEffect(() => { loadConvos(); }, []);

  const loadConvos = async () => {
    const all = await base44.entities.Conversation.list("-last_message_at", 100);
    setConversations(all.filter(c => c.members?.includes(currentUser?.email)));
  };

  const startDm = async (email) => {
    const existing = conversations.find(c => c.type === "dm" && c.members?.includes(email) && c.members?.includes(currentUser.email));
    if (existing) { setActiveId(existing.id); setShowNew(false); return; }
    const newC = await base44.entities.Conversation.create({ type: "dm", members: [currentUser.email, email], last_message_at: new Date().toISOString() });
    setConversations(p => [newC, ...p]);
    setActiveId(newC.id);
    setShowNew(false);
  };

  const filteredConvos = conversations.filter(c => {
    const otherEmail = c.members?.find(m => m !== currentUser?.email);
    const otherUser = allUsers.find(u => u.email === otherEmail);
    const name = getDisplayName(otherUser) || otherEmail || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const filteredUsers = allUsers.filter(u =>
    u.email !== currentUser?.email &&
    ((u.display_name || "").toLowerCase().includes(newSearch.toLowerCase()) || (u.username || "").toLowerCase().includes(newSearch.toLowerCase()) || u.email.toLowerCase().includes(newSearch.toLowerCase()))
  );

  const activeConvo = conversations.find(c => c.id === activeId);

  return (
    <div className="flex-1 flex h-full min-w-0">
      <div className="w-60 flex-shrink-0 flex flex-col border-r border-white/50 h-full" style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(20px)" }}>
        <div className="p-3 space-y-2 border-b border-white/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Direct Messages</span>
            <Button size="icon" variant="ghost" onClick={() => setShowNew(!showNew)} className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
          </div>
          {showNew ? (
            <div>
              <Input placeholder="Search users..." value={newSearch} onChange={e => setNewSearch(e.target.value)} className="h-8 text-xs bg-white/60 border-white/80" autoFocus />
              <div className="mt-1 max-h-40 overflow-y-auto space-y-0.5">
                {filteredUsers.map(u => (
                  <button key={u.id} onClick={() => startDm(u.email)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/50 text-left" onContextMenu={e => { e.preventDefault(); onOpenProfile?.(u); }}>
                    <UserAvatar name={getDisplayName(u)} email={u.email} size="xs" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-medium truncate">{getDisplayName(u)}</p>
                        <StatusDot status={u.status} />
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">@{getUsername(u)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs bg-white/60 border-white/80" />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredConvos.map(c => {
            const otherEmail = c.members?.find(m => m !== currentUser?.email);
            const otherUser = allUsers.find(u => u.email === otherEmail);
            const name = getDisplayName(otherUser) || otherEmail;
            return (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${activeId === c.id ? "bg-white/60 shadow-sm" : "hover:bg-white/40"}`}
              >
                <UserAvatar name={name} email={otherEmail} size="xs" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold truncate">{name}</p>
                    <StatusDot status={otherUser?.status} />
                  </div>
                  {c.last_message_preview && <p className="text-[10px] text-muted-foreground truncate">{c.last_message_preview}</p>}
                </div>
              </button>
            );
          })}
        </div>
        {/* User footer - same as server sidebar */}
        <div className="p-3 border-t border-white/20 flex items-center gap-2.5">
          <button onClick={() => onOpenProfile?.(currentUser)} className="relative">
            <UserAvatar name={getDisplayName(currentUser)} email={currentUser?.email} size="sm" />
            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white/80 shadow-sm ${STATUS_COLOR[currentUser?.status] || "bg-gray-400"}`} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{getDisplayName(currentUser)}</p>
            <p className="text-[10px] text-muted-foreground truncate capitalize">{STATUS_LABEL[currentUser?.status] || "Offline"}</p>
          </div>
          <button onClick={onOpenSettings} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/40 transition-colors">
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <ChatPane convo={activeConvo} currentUser={currentUser} allUsers={allUsers} />
    </div>
  );
}