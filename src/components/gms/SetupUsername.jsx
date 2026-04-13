import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import GlassCard from "./GlassCard";

export default function SetupUsername({ onDone }) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    const u = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const d = displayName.trim();
    if (!u || u.length < 3) { setError("Username must be at least 3 characters (letters, numbers, _)"); return; }
    if (!d) { setError("Please enter a display name"); return; }
    setLoading(true);
    // Check uniqueness
    const existing = await base44.entities.User.filter({ username: u }, "-created_date", 1);
    const me = await base44.auth.me();
    const conflict = existing.find(x => x.id !== me.id);
    if (conflict) { setError("Username taken, try another"); setLoading(false); return; }
    await base44.auth.updateMe({ username: u, display_name: d });
    onDone();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <GlassCard className="w-full max-w-sm p-8 text-center animate-pop">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Welcome to GMSChat</h1>
        <p className="text-sm text-muted-foreground mb-6">Choose your username to get started</p>

        <div className="space-y-3 text-left">
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Display Name</label>
            <Input
              placeholder="How others see you"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="bg-white/60 border-white/80 focus:bg-white/80"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1 block">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input
                placeholder="yourhandle"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="bg-white/60 border-white/80 focus:bg-white/80 pl-7"
                onKeyDown={e => e.key === "Enter" && handle()}
              />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <Button
          onClick={handle}
          disabled={loading}
          className="w-full mt-5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-md"
        >
          {loading ? "Setting up..." : "Let's go! ✨"}
        </Button>
      </GlassCard>
    </div>
  );
}