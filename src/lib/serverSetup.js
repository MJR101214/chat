import { base44 } from "@/api/base44Client";

const DEFAULT_SERVER = {
  name: "8th Graders",
  description: "Welcome to the official 8th Graders server!",
  is_default: true,
};

const DEFAULT_CHANNELS = [
  { name: "announcements", type: "announcement", category: "INFORMATION", order: 0 },
  { name: "rules", type: "text", category: "INFORMATION", order: 1 },
  { name: "general", type: "text", category: "GENERAL", order: 0 },
  { name: "off-topic", type: "text", category: "GENERAL", order: 1 },
  { name: "memes", type: "text", category: "GENERAL", order: 2 },
  { name: "math", type: "text", category: "SUBJECTS", order: 0 },
  { name: "english", type: "text", category: "SUBJECTS", order: 1 },
  { name: "science", type: "text", category: "SUBJECTS", order: 2 },
  { name: "history", type: "text", category: "SUBJECTS", order: 3 },
  { name: "introductions", type: "text", category: "SOCIAL", order: 0 },
  { name: "compliments", type: "text", category: "SOCIAL", order: 1 },
  { name: "Lounge", type: "voice", category: "VOICE", order: 0 },
  { name: "Study Hall", type: "voice", category: "VOICE", order: 1 },
  { name: "Gaming", type: "voice", category: "VOICE", order: 2 },
];

/**
 * Ensure default server exists for user
 * @param {string} userEmail
 */
export async function ensureDefaultServer(userEmail) {
  // Check if default server exists
  let servers = await base44.entities.Server.filter({ is_default: true }, "-created_date", 1);
  let server = servers[0];

  if (!server) {
    server = await base44.entities.Server.create({ ...DEFAULT_SERVER, members: [userEmail] });
    // Create channels
    for (const ch of DEFAULT_CHANNELS) {
      await base44.entities.ServerChannel.create({ ...ch, server_id: server.id });
    }
  } else if (!server.members?.includes(userEmail)) {
    await base44.entities.Server.update(server.id, {
      members: [...(server.members || []), userEmail],
    });
  }

  return server;
}

/**
 * Get channels for a server
 * @param {string} serverId
 */
export async function getServerChannels(serverId) {
  return base44.entities.ServerChannel.filter({ server_id: serverId }, "order", 100);
}