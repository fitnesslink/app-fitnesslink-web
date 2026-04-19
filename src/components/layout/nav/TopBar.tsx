"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Popover } from "@/components/ui/Popover";

interface TopBarProps {
  subtitle?: string;
}

export function TopBar({ subtitle = "Have a nice day" }: TopBarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const name = user?.firstName ?? "there";

  return (
    <header className="h-16 bg-surface border-b border-border-soft flex items-center justify-between px-6">
      <div className="min-w-0">
        <p className="text-base font-semibold text-text-primary truncate">
          Hello, {name}
        </p>
        <p className="text-xs text-text-secondary truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-primary-soft hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </svg>
        </button>
        <Popover
          align="end"
          trigger={
            <button
              type="button"
              aria-label="Account menu"
              className="inline-flex items-center gap-2 p-1 rounded-full hover:bg-primary-soft transition-colors"
            >
              <Avatar
                name={user ? `${user.firstName} ${user.lastName}`.trim() : undefined}
                size="md"
              />
              <svg className="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          }
        >
          <div className="p-2 min-w-[180px]">
            <div className="px-2 py-1.5 border-b border-border-soft mb-1">
              <p className="text-sm font-medium text-text-primary truncate">
                {user ? `${user.firstName} ${user.lastName}`.trim() : "Signed out"}
              </p>
              {user?.email && (
                <p className="text-xs text-text-secondary truncate">{user.email}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                router.push("/profile");
              }}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-primary-soft text-sm text-text-primary"
            >
              Profile
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-primary-soft text-sm text-danger"
            >
              Sign out
            </button>
          </div>
        </Popover>
      </div>
    </header>
  );
}
