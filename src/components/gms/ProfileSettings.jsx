import { useState } from "react";
import { X, Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { getDisplayName, getUsername } from "@/lib/useCurrentUser";
import UserAvatar from "../chat/UserAvatar";
import GlassCard from "./GlassCard";

const STATUSES = [
  { value: "online", label: "Online", color: "bg-green-400" },
  { value: "away", label: "Away", color: "bg-amber-400" },
  { value: "mid_test", label: "Mid Test", color: "bg-red-400" },
  { value: "offline", label: "Offline", color: "bg-gray-400" },
];

export default function ProfileSettings({ user, onClose, onSaved }) {
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [status, setStatus] = useState(user?.status || "online");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    const u = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!u || u.length < 3) { setError("Username must be at least 3 chars"); return; }
    if (!displayName.trim()) { setError("Display name required"); return; }
    setSaving(true);
    const existing = await base44.entities.User.filter({ username: u }, "-created_date", 1);
    const conflict = existing.find(x => x.id !== user.id);
    if (conflict) { setError("Username taken"); setSaving(false); return; }
    await base44.auth.updateMe({ display_name: displayName.trim(), username: u, bio, status });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/10 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile & Settings</h2>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-8 w-8"><X className="h-4 w-4" /></Button>
        </div>

        <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-white/40">
          <UserAvatar name={displayName || user?.display_name} email={user?.email} size="xl" />
          <div>
            <p className="font-bold text-base">{displayName || getDisplayName(user)}</p>
            <p className="text-sm text-muted-foreground">@{username || getUsername(user)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Display Name</label>
            <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="bg-white/60 border-white/80" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} className="bg-white/60 border-white/80 pl-7" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Bio</label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} className="bg-white/60 border-white/80 resize-none text-sm" placeholder="Tell people about yourself..." />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1.5 block">Status</label>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => (
                <button key={s.value} onClick={() => setStatus(s.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${status === s.value ? "bg-primary/10 border-primary/40 text-primary" : "bg-white/40 border-white/60 text-muted-foreground hover:bg-white/60"}`}
                >
                  <span className={`h-2 w-2 rounded-full ${s.color}`} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <Button onClick={save} disabled={saving} className="w-full mt-5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-md">
          <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </GlassCard>
    </div>
  );
}