import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Heart, Share2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/liquid-glass";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { base44 } from "@/api/base44Client";
import { getDisplayName } from "@/lib/useCurrentUser";

// 50 popular YouTube videos (short/music/viral)
const SEED_IDS = [
  ["dQw4w9WgXcQ","Never Gonna Give You Up"],["9bZkp7q19f0","Gangnam Style"],
  ["kJQP7kiw5Fk","Despacito"],["JGwWNGJdvx8","Shape of You"],
  ["RgKAFK5djSk","See You Again"],["OPf0YbXqDm0","Uptown Funk"],
  ["fRh_vgS2dFE","Sorry"],["pRpeEdMmmQ0","Shake It Off"],
  ["YQHsXMglC9A","Hello"],["hT_nvWreIhg","Counting Stars"],
  ["CevxZvSJLk8","Katy Perry - Roar"],["e-ORhEE9VVg","Thinking Out Loud"],
  ["2Vv-BfVoq4g","Perfect"],["nfWlot6h_JM","Titanium"],
  ["djV11Xbc914","Africa by Toto"],["lp-EO5I60KA","Can't Stop the Feeling"],
  ["SlPhMPnQ58k","Havana"],["3AtDnEC4zak","Old Town Road"],
  ["GCDjCTWPBxI","Stay (Kid LAROI)"],["H5v3kku4y6Q","Bad Guy"],
  ["r7qovpFAGrQ","Blinding Lights"],["UceaB4D0jpo","Levitating"],
  ["b1kbLwvqugk","Watermelon Sugar"],["AJtDXIazrMo","drivers license"],
  ["SCQzRUGGOsY","Peaches"],["CcgmqpFaWNI","good 4 u"],
  ["iPUmE-tne5U","Butter (BTS)"],["gdZLi9oWNZg","Permission to Dance"],
  ["TUVcZfQe-Kw","IDOL (BTS)"],["V1bFr2SWP1I","Dynamite (BTS)"],
  ["Ek0SgwIGQeU","Savage Love"],["fHI8X4OXv7k","Mood"],
  ["d_HlPboLRL8","Montero"],["bgFqCCxfC6Y","Positions"],
  ["p3cKCs_-k8I","34+35"],["4NRXx6U8ekw","Leave The Door Open"],
  ["IHNzOHi8sJs","Perc % Bass"],["l5OSSBl_3-E","Heat Waves"],
  ["cGkb6vHbWcA","Shivers"],["iSpDEBKNDUs","Easy On Me"],
  ["0MTkOTHH-w4","Ghost"],["v8Ql8SzPhrY","Industry Baby"],
  ["UrH9pJXEAp8","Stay With Me"],["9HDos2BKjBQ","Love Story (Taylor's Version)"],
  ["ag6XhUwajMU","You Belong With Me"],["7PCkvCPvDXk","Bad Blood"],
  ["1ekZEVeXwmk","22"],["2LaqWdOuV00","Anti-Hero"],
  ["K-a8s8OLBSE","Flowers"],["OMDmNFVCbww","Unholy"],
];

/**
 * @param {string} id
 * @returns {string}
 */
function makeEmbed(id) {
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&rel=0`;
}

/**
 * @param {any} post
 * @returns {number}
 */
function score(post) {
  const ageHours = (Date.now() - new Date(post.created_date).getTime()) / 3600000;
  return Math.max(0, 100 - ageHours * 0.5) + (post.likes || 0) * 3 + (post.is_app_user ? 80 : 0) + Math.random() * 10;
}

/**
 * @param {{post: any, currentUser: any, onLike: (id: string) => void, active: boolean}} props
 */
function VideoSlide({ post, currentUser, onLike, active }) {
  const liked = post.liked_by?.includes(currentUser?.email);
  return (
    <div className="absolute inset-0 flex">
      <div className="flex-1 relative bg-black overflow-hidden">
        {active ? (
          <iframe
            src={post.embed_url}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen"
            title={post.title}
            style={{ border: "none", pointerEvents: "none" }}
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            {post.thumbnail && <img src={post.thumbnail} alt="" className="w-full h-full object-cover opacity-50" />}
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 40%, transparent 70%, rgba(0,0,0,0.2) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-16 p-4 pointer-events-none">
          <p className="text-white font-bold text-sm">{post.poster_display || "GMS Picks"}</p>
          <p className="text-white/80 text-xs mt-1 line-clamp-2">{post.title || "Video"}</p>
          <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">▶ YouTube</span>
        </div>
      </div>
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        <button onClick={() => onLike(post.id)} className="flex flex-col items-center gap-1">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30 transition-all ${liked ? "bg-red-500/80" : "bg-white/20 hover:bg-white/35"}`}>
            <Heart className={`h-5 w-5 text-white ${liked ? "fill-white" : ""}`} />
          </div>
          <span className="text-white text-xs font-medium">{post.likes || 0}</span>
        </button>
        <button
          onClick={() => navigator.share?.({ url: post.url }).catch(() => navigator.clipboard.writeText(post.url))}
          className="flex flex-col items-center gap-1"
        >
          <div className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all">
            <Share2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-xs font-medium">Share</span>
        </button>
      </div>
    </div>
  );
}

/**
 * @param {{currentUser: any}} props
 */
export default function VideoFeed({ currentUser }) {
  const [posts, setPosts] = useState(/** @type {any[]} */ ([]));
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const indexRef = useRef(0);
  const postsLenRef = useRef(0);
  const cooldown = useRef(false);
  const touchStartY = useRef(null);
  const containerRef = useRef(null);

  // keep refs in sync
  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { postsLenRef.current = posts.length; }, [posts]);

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    let data = await base44.entities.VideoPost.list("-created_date", 200);
    if (data.length < 10) {
      const toCreate = SEED_IDS.map(([id, title]) => ({
        url: `https://youtu.be/${id}`,
        title,
        embed_url: makeEmbed(id),
        platform: "youtube",
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        poster_email: "system@gmschat.app",
        poster_display: "GMS Picks",
        is_app_user: false,
        likes: 0,
        liked_by: [],
      }));
      await base44.entities.VideoPost.bulkCreate(toCreate);
      data = await base44.entities.VideoPost.list("-created_date", 200);
    }
    setPosts([...data].sort((a, b) => score(b) - score(a)));
    setLoading(false);
  };

  const go = useCallback((/** @type {number} */ dir) => {
    if (cooldown.current) return;
    cooldown.current = true;
    setTimeout(() => { cooldown.current = false; }, 550);
    if (dir === "next") {
      setIndex(i => Math.min(i + 1, postsLenRef.current - 1));
    } else {
      setIndex(i => Math.max(i - 1, 0));
    }
  }, []);

  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 40) go("next");
    else if (diff < -40) go("prev");
    touchStartY.current = null;
  };

  // Stable wheel handler using ref so it never gets stale
  const goRef = useRef(go);
  useEffect(() => { goRef.current = go; }, [go]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 10) goRef.current("next");
      else if (e.deltaY < -10) goRef.current("prev");
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []); // run once only — handler reads from ref

  const handleLike = async (postId) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const liked = post.liked_by?.includes(currentUser.email);
    const liked_by = liked ? post.liked_by.filter(e => e !== currentUser.email) : [...(post.liked_by || []), currentUser.email];
    await base44.entities.VideoPost.update(postId, { likes: liked_by.length, liked_by });
    setPosts(p => p.map(x => x.id === postId ? { ...x, likes: liked_by.length, liked_by } : x));
  };

  const addPost = async () => {
    if (!newUrl.trim()) return;
    setAdding(true);
    const match = newUrl.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/\s]+)/);
    const id = match?.[1];
    await base44.entities.VideoPost.create({
      url: newUrl.trim(),
      title: newTitle.trim() || "Shared video",
      embed_url: id ? makeEmbed(id) : newUrl.trim(),
      platform: "youtube",
      thumbnail: id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null,
      poster_email: currentUser.email,
      poster_display: getDisplayName(currentUser),
      is_app_user: true,
      likes: 0,
      liked_by: [],
    });
    setAdding(false);
    setNewUrl(""); setNewTitle("");
    setAddOpen(false);
    loadPosts();
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}>
        <div>
          <h2 className="text-white font-bold text-base">For You</h2>
          <p className="text-white/60 text-[10px]">{posts.length} videos · scroll or swipe</p>
        </div>
        <Button onClick={() => setAddOpen(true)} size="sm" className="bg-red-600 hover:bg-red-700 text-white border-0 text-xs h-8 rounded-xl shadow-lg">
          <Plus className="h-3.5 w-3.5 mr-1" /> Share
        </Button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full bg-black gap-3">
            <div className="w-8 h-8 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            <p className="text-white/40 text-xs">Loading videos...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full bg-black text-white/60">
            <p className="font-medium">No videos yet</p>
          </div>
        ) : (
          posts.map((post, i) => (
            <div
              key={post.id}
              className="absolute inset-0"
              style={{ transform: `translateY(${(i - index) * 100}%)`, transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)" }}
            >
              <VideoSlide post={post} currentUser={currentUser} onLike={handleLike} active={i === index} />
            </div>
          ))
        )}
      </div>

      {posts.length > 1 && (
        <div className="absolute right-3 top-1/3 z-20 flex flex-col gap-2 items-center">
          <button onClick={() => go("prev")} disabled={index === 0} className="h-9 w-9 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center disabled:opacity-20 text-white hover:bg-white/35 transition-all">
            <ChevronUp className="h-4 w-4" />
          </button>
          <span className="text-white/60 text-[10px]">{index + 1}/{posts.length}</span>
          <button onClick={() => go("next")} disabled={index === posts.length - 1} className="h-9 w-9 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center disabled:opacity-20 text-white hover:bg-white/35 transition-all">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <Glass className="p-6" variant="default">
            <DialogHeader><DialogTitle>Share a YouTube Video</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://youtu.be/..." className="bg-white/70 border-white/90" />
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Title (optional)" className="bg-white/70 border-white/90" />
              <Button onClick={addPost} disabled={adding || !newUrl.trim()} className="w-full bg-red-600 hover:bg-red-700 text-white border-0">
                {adding ? "Sharing..." : "Share"}
              </Button>
            </div>
          </Glass>
        </DialogContent>
      </Dialog>
    </div>
  );
}