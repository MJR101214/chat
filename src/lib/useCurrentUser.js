import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * @typedef {Object} User
 * @property {string} email
 * @property {string} [username]
 * @property {string} [display_name]
 * @property {string} [full_name]
 */

/**
 * Get current user hook
 * @returns {{user: User | null, loading: boolean, refresh: () => Promise<void>}}
 */
export function useCurrentUser() {
  const [user, setUser] = useState(/** @type {User | null} */ (null));
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const u = await base44.auth.me();
    setUser(u ? { ...u, full_name: u.full_name || undefined } : null);
  };

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u ? { ...u, full_name: u.full_name || undefined } : null); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return { user, loading, refresh };
}

/**
 * Get display name for a user
 * @param {User | null | undefined} user
 * @returns {string}
 */
export function getDisplayName(user) {
  return user?.display_name || user?.username || user?.full_name || user?.email?.split("@")[0] || "User";
}

/**
 * Get username for a user
 * @param {User | null | undefined} user
 * @returns {string}
 */
export function getUsername(user) {
  return user?.username || user?.email?.split("@")[0] || "user";
}