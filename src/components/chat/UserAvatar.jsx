const GRADIENTS = [
  "from-purple-400 to-pink-400",
  "from-blue-400 to-cyan-400",
  "from-pink-400 to-rose-400",
  "from-green-400 to-teal-400",
  "from-amber-400 to-orange-400",
  "from-indigo-400 to-purple-400",
  "from-teal-400 to-green-400",
  "from-rose-400 to-pink-400",
];

/**
 * Get gradient class for a string
 * @param {string | undefined} str
 * @returns {string}
 */
function getGradient(str) {
  let hash = 0;
  const safeStr = str || "";
  for (let i = 0; i < safeStr.length; i++) {
    hash = safeStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

/**
 * Get initials from name
 * @param {string | undefined} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** @type {Record<string, string>} */
const sizes = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

/**
 * @typedef {Object} UserAvatarProps
 * @property {string} [name] - User's display name
 * @property {string} [email] - User's email
 * @property {string} [size='md'] - Avatar size
 * @property {boolean} [online] - Whether user is online
 * @property {string} [className] - Additional CSS classes
 */

/**
 * User Avatar component
 * @param {UserAvatarProps} props
 */
export default function UserAvatar({ name, email, size = "md", online, className = "" }) {
  const initials = getInitials(name || email);
  const gradient = getGradient(email || name);
  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-semibold text-white shadow-sm`}>
        {initials}
      </div>
      {online !== undefined && (
        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${online ? "bg-green-400" : "bg-gray-300"}`} />
      )}
    </div>
  );
}