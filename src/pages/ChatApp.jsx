import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useCurrentUser, getDisplayName } from "@/lib/useCurrentUser";
import { ensureDefaultServer, getServerChannels } from "@/lib/serverSetup";
import SkyBackground from "../components/gms/SkyBackground";
import AppSidebar from "../components/gms/AppSidebar";
import ServerSidebar from "../components/gms/ServerSidebar";
import ChannelChat from "../components/gms/ChannelChat";
import ServerThreadPanel from "../components/gms/ServerThreadPanel";
import DmSection from "../components/gms/DmSection";
import FunSection from "../components/gms/FunSection";
import SetupUsername from "../components/gms/SetupUsername";
import ProfileSettings from "../components/gms/ProfileSettings";
import UserProfileModal from "../components/gms/UserProfileModal";

export default function ChatApp() {
  const { user, loading, refresh } = useCurrentUser();
  const [tab, setTab] = useState("servers");
  const [servers, setServers] = useState(/** @type {any[]} */ ([]));
  const [activeServerId, setActiveServerId] = useState(/** @type {string | null} */ (null));
  const [channelsByServer, setChannelsByServer] = useState(/** @type {Record<string, any[]>} */ ({}));
  const [activeChannelId, setActiveChannelId] = useState(/** @type {string | null} */ (null));
  const [threadMessage, setThreadMessage] = useState(/** @type {any | null} */ (null));
  const [allUsers, setAllUsers] = useState(/** @type {any[]} */ ([]));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(/** @type {any | null} */ (null));
  const [appReady, setAppReady] = useState(false);

  const needsSetup = user && !loading && !user.username;

  useEffect(() => {
    if (user && user.username) initApp();
  }, [user?.username]);

  const initApp = async () => {
    if (!user?.email) return;
    const [allU] = await Promise.all([
      base44.entities.User.list("-created_date", 200),
    ]);
    setAllUsers(allU);

    const defaultServer = await ensureDefaultServer(user.email);
    const channels = await getServerChannels(defaultServer.id);
    setServers([defaultServer]);
    setChannelsByServer({ [defaultServer.id]: channels });
    setActiveServerId(defaultServer.id);
    const general = channels.find(c => c.name === "general") || channels[0];
    if (general) setActiveChannelId(general.id);
    setAppReady(true);
  };

  const handleSetupDone = async () => {
    await refresh();
  };

  const handleSettingsSaved = async () => {
    await refresh();
    setSettingsOpen(false);
  };

  const activeServer = servers.find(s => s.id === activeServerId);
  const activeChannels = activeServerId ? (channelsByServer[activeServerId] || []) : [];
  const activeChannel = activeChannels.find((/** @type {any} */ c) => c.id === activeChannelId);

  if (loading) {
    return (
      <>
        <SkyBackground />
        <div className="h-screen flex items-center justify-center">
          <div className="text-center animate-fade-up">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <span className="text-white font-black text-xl">g m s</span>
            </div>
            <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SkyBackground />

      {needsSetup && <SetupUsername onDone={handleSetupDone} />}
      {settingsOpen && user && (
        <ProfileSettings user={user} onClose={() => setSettingsOpen(false)} onSaved={handleSettingsSaved} />
      )}
      {profileUser && (
        <UserProfileModal
          user={profileUser}
          currentUser={user}
          onClose={() => setProfileUser(null)}
          onStartDm={(/** @type {string} */ email) => { setTab("dms"); setProfileUser(null); }}
        />
      )}

      <div className="h-screen flex flex-row gap-3 overflow-hidden relative">
        {/* Left: thin app sidebar */}
        <AppSidebar
          activeTab={tab}
          onChangeTab={setTab}
          servers={servers}
          activeServerId={activeServerId}
          onSelectServer={(/** @type {string} */ id) => { setActiveServerId(id); setTab("servers"); setThreadMessage(null); }}
        />

        {/* Server sidebar (only in servers tab) */}
        {tab === "servers" && appReady && (
          <ServerSidebar
            server={activeServer}
            channels={activeChannels}
            activeChannelId={activeChannelId}
            onSelectChannel={(/** @type {string} */ id) => { setActiveChannelId(id); setThreadMessage(null); }}
            currentUser={user}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenProfile={() => setProfileUser(user)}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {tab === "servers" && appReady && (
            <>
              <ChannelChat channel={activeChannel} currentUser={user || undefined} onOpenThread={(/** @type {any} */ msg) => setThreadMessage(msg)} />
              {threadMessage && (
                <ServerThreadPanel parentMessage={threadMessage} currentUser={user} onClose={() => setThreadMessage(null)} />
              )}
            </>
          )}

          {tab === "dms" && (
            <DmSection currentUser={user} allUsers={allUsers} onOpenProfile={(/** @type {any} */ user) => setProfileUser(user)} onOpenSettings={() => setSettingsOpen(true)} />
          )}

          {tab === "fun" && (
            <FunSection currentUser={user} />
          )}

          {tab === "servers" && !appReady && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}