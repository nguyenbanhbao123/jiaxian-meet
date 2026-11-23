import { useState } from "react";

export type AuthUser = {
  id: number;
  username: string;
  avatarUrl?: string | null;
};

type Props = {
  user: AuthUser;
  onLogout?: () => void;
};

export default function Avatar({ user, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = user.username.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={`${user.username} account menu`}
        aria-expanded={menuOpen}
        className="flex items-center gap-2 rounded-full p-0.5 transition hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="h-8 w-8 rounded-full object-cover border border-white/20"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white border border-white/20">
            {initial}
          </span>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-white/15 bg-zinc-900 p-1.5 shadow-lg z-50">
          <p className="truncate px-2 py-1 text-xs text-zinc-400">
            {user.username}
          </p>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              className="w-full rounded px-2 py-1.5 text-left text-sm text-red-400 hover:bg-white/10"
            >
              Log Out
            </button>
          )}
        </div>
      )}
    </div>
  );
}