import { useState, useEffect, useRef } from "react";
import { Megaphone, SmilePlus, MessageSquare, Trash2, Send, Paperclip, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Glass } from "@/components/ui/liquid-glass";
import { base44 } from "@/api/base44Client";
import { getDisplayName } from "@/lib/useCurrentUser";
import UserAvatar from "../chat/UserAvatar";
import GlassCard from "./GlassCard";
import moment from "moment";

const EMOJIS = ["👍","❤️","😂","😮","😢","🔥","🎉","👀","💯","✨"];

/**
 * @typedef {Object} ServerMessage
 * @property {string} id
 * @property {string} channel_id
 * @property {string} sender_email
 * @property {string} sender_display
 * @property {string} content
 * @property {string} [attachment_url]
 * @property {Record<string, string[]>} [reactions]
 * @property {number} thread_count
 * @property {string} created_date
 * @property {string} [thread_parent_id]
 */

/**
 * @typedef {Object} User
 * @property {string} email
 * @property {string} [username]
 * @property {string} [display_name]
 */

/**
 * Message Row component
 * @param {{msg: ServerMessage, currentUser: User, onReact: (id: string, emoji: string) => void, onDelete: (id: string) => void, onOpenThread: (msg: ServerMessage) => void}} props
 */
function MessageRow({ msg, currentUser, onReact, onDelete, onOpenThread }) {
  const [hovered, setHovered] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const isOwn = msg.sender_email === currentUser?.email;
  const reactions = msg.reactions || {};

  return (
    <div
      className="group relative flex gap-3 px-4 py-1.5 rounded-xl hover:bg-white/30 transition-all"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setEmojiOpen(false); }}
    >
      <UserAvatar name={msg.sender_display} email={msg.sender_email} size="sm" online={false} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">{msg.sender_display}</span>
          <span className="text-[10px] text-muted-foreground">{moment(msg.created_date).format("h:mm A")}</span>
        </div>
        {msg.content && <p className="text-sm text-foreground/80 leading-relaxed break-words whitespace-pre-wrap mt-0.5">{msg.content}</p>}
        {msg.attachment_url && (
          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="block mt-1">
            {msg.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
              ? <img src={msg.attachment_url} alt="attachment" className="max-w-xs max-h-60 rounded-xl border border-white/40 shadow-sm" />
              : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/50 border border-white/70 rounded-xl text-xs text-primary hover:bg-white/70 transition-colors"><Paperclip className="h-3 w-3" />View File</span>
            }
          </a>
        )}
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(reactions).map(([emoji, users]) => (
              <button key={emoji} onClick={() => onReact(msg.id, emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                  users.includes(currentUser?.email)
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-white/50 border-white/70 text-foreground/70 hover:bg-white/70"
                }`}
              >
                <span>{emoji}</span><span className="font-medium">{users.length}</span>
              </button>
            ))}
          </div>
        )}
        {msg.thread_count > 0 && (
          <button onClick={() => onOpenThread(msg)} className="flex items-center gap-1.5 mt-1 text-xs text-primary hover:text-primary/70 transition-colors">
            <MessageSquare className="h-3 w-3" />
            <span>{msg.thread_count} {msg.thread_count === 1 ? "reply" : "replies"}</span>
          </button>
        )}
      </div>

      {(hovered || emojiOpen) && (
        <div className="absolute right-4 -top-3 flex items-center gap-0.5 bg-white/80 backdrop-blur border border-white/90 rounded-xl shadow-lg p-0.5 z-10 animate-pop">
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-white/60"><SmilePlus className="h-3.5 w-3.5 text-muted-foreground" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 bg-white/90 border-white/90 backdrop-blur" side="top">
              <div className="flex gap-1 flex-wrap max-w-48">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => { onReact(msg.id, e); setEmojiOpen(false); }}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-purple-100 transition-colors text-lg">{e}</button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-white/60" onClick={() => onOpenThread(msg)}><MessageSquare className="h-3.5 w-3.5 text-muted-foreground" /></Button>
          {isOwn && (
            <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-red-100" onClick={() => onDelete(msg.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChannelChat(/** @type {{channel: any, currentUser: User, onOpenThread: (msg: ServerMessage) => void}} */ { channel, currentUser, onOpenThread }) {
  const [messages, setMessages] = useState(/** @type {ServerMessage[]} */ ([]));
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState(/** @type {string | null} */ (null));
  /** @type {import('react').RefObject<HTMLInputElement>} */
  const fileRef = useRef(null);
  /** @type {import('react').RefObject<HTMLDivElement>} */
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!channel) return;
    loadMessages();
    const unsub = base44.entities.ServerMessage.subscribe((event) => {
      if (event.data?.channel_id !== channel.id || event.data?.thread_parent_id) return;
      if (event.type === "create") setMessages(p => [...p, event.data]);
      else if (event.type === "update") setMessages(p => p.map(m => m.id === event.id ? event.data : m));
      else if (event.type === "delete") setMessages(p => p.filter(m => m.id !== event.id));
    });
    return unsub;
  }, [channel?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    const data = await base44.entities.ServerMessage.filter({ channel_id: channel.id }, "created_date", 200);
    setMessages(/** @type {ServerMessage[]} */ (data.filter(m => !m.thread_parent_id)));
    setLoading(false);
  };



  const handleReact = async (/** @type {string} */ msgId, /** @type {string} */ emoji) => {
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    const r = { ...(msg.reactions || {}) };
    const us = r[emoji] || [];
    if (us.includes(currentUser.email)) {
      r[emoji] = us.filter(e => e !== currentUser.email);
      if (!r[emoji].length) delete r[emoji];
    } else {
      r[emoji] = [...us, currentUser.email];
    }
    await base44.entities.ServerMessage.update(msgId, { reactions: r });
    setMessages(p => p.map(m => m.id === msgId ? { ...m, reactions: r } : m));
  };

  const handleDelete = async (/** @type {string} */ id) => {
    await base44.entities.ServerMessage.delete(id);
    setMessages(p => p.filter(m => m.id !== id));
  };

  const handleFile = async (/** @type {React.ChangeEvent<HTMLInputElement>} */ e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setPendingFile(file_url);
    setUploading(false);
  };

  const send = async () => {
    if (!text.trim() && !pendingFile) return;
    await base44.entities.ServerMessage.create({
      channel_id: channel.id,
      server_id: channel.server_id,
      sender_email: currentUser.email,
      sender_display: getDisplayName(currentUser),
      content: text.trim(),
      attachment_url: pendingFile || undefined,
    });
    setText("");
    setPendingFile(null);
  };

  if (!channel) return <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Select a channel</div>;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Header */}
      <Glass className="h-14 flex items-center gap-2.5 px-5 border-b border-white/20 flex-shrink-0" variant="default">
        {channel.type === "announcement" ? <Megaphone className="h-4 w-4 text-primary" /> : null}
        <span className="font-semibold text-sm">{channel.name}</span>
      </Glass>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {loading ? (
          <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm font-medium">Welcome to {channel.name}</p>
            <p className="text-xs mt-1">Be the first to say something!</p>
          </div>
        ) : (
          messages.map(msg => (
            <MessageRow key={msg.id} msg={msg} currentUser={currentUser} onReact={handleReact} onDelete={handleDelete} onOpenThread={onOpenThread} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        {pendingFile && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-white/50 rounded-xl border border-white/60">
            <Paperclip className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-foreground/70 flex-1 truncate">{(/** @type {string} */ (pendingFile)).split("/").pop()}</span>
            <button onClick={() => setPendingFile(null)}><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
          </div>
        )}
        <Glass className="flex items-end gap-2 rounded-2xl p-2 border-0 shadow-sm" variant="default">
          <input type="file" ref={fileRef} className="hidden" onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/40 transition-colors text-muted-foreground flex-shrink-0">
            {uploading ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </button>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Message ${channel.name}`}
            rows={1}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none py-2 max-h-32"
            style={{ minHeight: "36px" }}
          />
          <Button onClick={send} disabled={!text.trim() && !pendingFile} size="icon" className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 border-0 shadow-sm hover:from-blue-600 hover:to-cyan-500 flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </Glass>
      </div>
    </div>
  );
}