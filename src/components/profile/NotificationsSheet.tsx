"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications as notifApi } from "@/lib/api/notifications";
import { Sheet } from "@/components/ui/Sheet";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { NotificationsEmpty } from "@/components/ui/empty-states";
import {
  placeholderNotifications,
  type AppNotification,
  type NotificationCategory,
} from "@/lib/profile/types";

interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
}

async function fetchNotifications(): Promise<AppNotification[]> {
  try {
    const res = (await notifApi.getMyNotification()) as
      | { items?: AppNotification[] }
      | AppNotification[];
    const items = Array.isArray(res) ? res : res.items ?? [];
    return items.length > 0 ? items : placeholderNotifications();
  } catch {
    return placeholderNotifications();
  }
}

export function NotificationsSheet({ open, onClose }: NotificationsSheetProps) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | NotificationCategory>("all");

  const { data: list = [] } = useQuery({
    queryKey: notifApi.keys.list(),
    queryFn: fetchNotifications,
    enabled: open,
    refetchInterval: open ? 30_000 : false, // poll while open
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notifApi.readNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notifApi.keys.all }),
  });
  const markAll = useMutation({
    mutationFn: () => notifApi.updateNotificationsReadAll(),
    onSuccess: () => qc.invalidateQueries({ queryKey: notifApi.keys.all }),
  });

  const filtered = useMemo(
    () => (tab === "all" ? list : list.filter((n) => n.category === tab)),
    [list, tab]
  );

  const unreadCount = list.filter((n) => !n.read).length;

  return (
    <Sheet open={open} onClose={onClose} title="Notifications" variant="side" width={420}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-secondary tabular-nums">
            {unreadCount} unread
          </p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAll.mutate()}
              className="text-xs text-primary font-medium hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        <Tabs defaultValue="all" variant="pill" onValueChange={(v) => setTab(v as typeof tab)}>
          <TabList>
            <Tab value="all">All</Tab>
            <Tab value="system">System</Tab>
            <Tab value="workout">Workout</Tab>
            <Tab value="nutrition">Nutrition</Tab>
          </TabList>
          <div className="mt-3">
            <TabPanel value="all"><List items={filtered} onRead={(id) => markRead.mutate(id)} onClose={onClose} /></TabPanel>
            <TabPanel value="system"><List items={filtered} onRead={(id) => markRead.mutate(id)} onClose={onClose} /></TabPanel>
            <TabPanel value="workout"><List items={filtered} onRead={(id) => markRead.mutate(id)} onClose={onClose} /></TabPanel>
            <TabPanel value="nutrition"><List items={filtered} onRead={(id) => markRead.mutate(id)} onClose={onClose} /></TabPanel>
          </div>
        </Tabs>

        <div className="pt-2 border-t border-border-soft">
          <Link
            href="/profile/notifications/preferences"
            onClick={onClose}
            className="text-sm text-primary font-medium hover:underline"
          >
            Notification settings
          </Link>
        </div>
      </div>
    </Sheet>
  );
}

function List({
  items,
  onRead,
  onClose,
}: {
  items: AppNotification[];
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  if (items.length === 0) {
    return <NotificationsEmpty />;
  }
  return (
    <ul className="space-y-1 -mx-2">
      {items.map((n) => {
        const body = (
          <div
            className={`rounded-lg px-3 py-2 transition-colors ${
              n.read ? "" : "bg-primary-soft/50"
            }`}
          >
            <div className="flex items-start gap-2">
              {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate">{n.title}</p>
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-text-secondary mt-1">{relative(n.createdAt)}</p>
              </div>
            </div>
          </div>
        );
        const handleClick = () => {
          if (!n.read) onRead(n.id);
          if (n.deepLink) onClose();
        };
        return (
          <li key={n.id}>
            {n.deepLink ? (
              <Link href={n.deepLink} onClick={handleClick} className="block">
                {body}
              </Link>
            ) : (
              <button type="button" onClick={handleClick} className="w-full text-left">
                {body}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}
