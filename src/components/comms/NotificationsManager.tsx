"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, SectionCard, StatPill } from "@/components/ui/ModulePrimitives";
import {
  contentManagerNotificationTopics,
  getNotificationBadgeLabel,
  getNotificationsForRole,
  getNotificationsPageDescription,
  isContentManagerRole,
  type AppNotification,
  type ContentNotificationGroup,
} from "@/lib/notifications";

const operationalTypeStyles = {
  Arrival: "bg-brand-soft text-brand",
  Payment: "bg-accent-soft text-[#8a6a2f]",
  Housekeeping: "bg-[#e7f0f5] text-info",
  System: "bg-surface-muted text-muted",
} as const;

const contentGroupStyles: Record<ContentNotificationGroup, string> = {
  "Content Update": "bg-brand-soft text-brand",
  "New Content Request": "bg-accent-soft text-[#8a6a2f]",
  "Content Approval": "bg-[#e7f0f5] text-info",
  Publishing: "bg-[#e8f3ec] text-[#2f6b56]",
  "Media / Asset": "bg-[#f0ebe3] text-[#6b5a45]",
  "Offers & Testimonials": "bg-[#edf4f1] text-[#3d6b5c]",
  "System / Permissions": "bg-surface-muted text-muted",
};

function badgeClassName(notification: AppNotification) {
  if (notification.channel === "content") {
    return contentGroupStyles[notification.group];
  }
  return operationalTypeStyles[notification.type];
}

export function NotificationsManager() {
  const { currentUser } = useAuth();
  const roleId = currentUser?.roleId;
  const seed = useMemo(() => getNotificationsForRole(roleId), [roleId]);
  const [items, setItems] = useState(seed);

  useEffect(() => {
    setItems(seed);
  }, [seed]);
  const unread = items.filter((n) => !n.read).length;
  const isContentManager = isContentManagerRole(roleId);

  const groupedItems = useMemo(() => {
    if (!isContentManager) return null;

    const groups = new Map<ContentNotificationGroup, AppNotification[]>();
    for (const item of items) {
      if (item.channel !== "content") continue;
      const existing = groups.get(item.group) ?? [];
      existing.push(item);
      groups.set(item.group, existing);
    }
    return groups;
  }, [isContentManager, items]);

  function markAllRead() {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  }

  function toggleRead(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item)),
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={getNotificationsPageDescription(roleId)}
        action={
          <button
            type="button"
            onClick={markAllRead}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-surface-muted"
          >
            Mark all read
          </button>
        }
      />

      {isContentManager ? (
        <SectionCard title="What you'll be notified about">
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 xl:grid-cols-3">
            {contentManagerNotificationTopics.map((topic) => (
              <div key={topic.group} className="rounded-xl border border-border-subtle bg-surface-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">{topic.group}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted">
                  {topic.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatPill label="Total" value={items.length} />
        <StatPill label="Unread" value={unread} tone="warning" />
        <StatPill label="Read" value={items.length - unread} tone="success" />
      </div>

      {isContentManager && groupedItems ? (
        <div className="space-y-5">
          {contentManagerNotificationTopics.map((topic) => {
            const groupItems = groupedItems.get(topic.group) ?? [];
            if (groupItems.length === 0) return null;

            return (
              <SectionCard key={topic.group} title={topic.group}>
                <NotificationList
                  items={groupItems}
                  onToggleRead={toggleRead}
                  badgeClassName={badgeClassName}
                />
              </SectionCard>
            );
          })}
        </div>
      ) : (
        <SectionCard title="Alert feed">
          <NotificationList
            items={items}
            onToggleRead={toggleRead}
            badgeClassName={badgeClassName}
          />
        </SectionCard>
      )}
    </div>
  );
}

function NotificationList({
  items,
  onToggleRead,
  badgeClassName,
}: {
  items: AppNotification[];
  onToggleRead: (id: string) => void;
  badgeClassName: (notification: AppNotification) => string;
}) {
  return (
    <ul className="divide-y divide-border-subtle">
      {items.map((item) => (
        <li
          key={item.id}
          className={`flex flex-wrap items-start justify-between gap-3 px-5 py-4 ${
            item.read ? "bg-surface" : "bg-brand-soft/30"
          }`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{item.title}</p>
              <Badge className={badgeClassName(item)}>
                {getNotificationBadgeLabel(item)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{item.message}</p>
            <p className="mt-1 text-xs text-muted">{item.time}</p>
          </div>
          <button
            type="button"
            onClick={() => onToggleRead(item.id)}
            className="text-sm font-medium text-brand-mid hover:text-brand"
          >
            {item.read ? "Mark unread" : "Mark read"}
          </button>
        </li>
      ))}
    </ul>
  );
}
