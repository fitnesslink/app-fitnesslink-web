"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS, isNavItemActive, type NavItem } from "./routes";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-[240px] shrink-0 bg-surface border-r border-border-soft h-dvh sticky top-0"
      aria-label="Primary"
    >
      <div className="flex items-center px-5 h-16 border-b border-border-soft">
        <Image
          src="/images/logo.png"
          alt="FitnessLink"
          width={780}
          height={156}
          priority
          className="h-8 w-auto"
        />
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.id} item={item} pathname={pathname} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function SidebarItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isNavItemActive(pathname, item);
  const hasChildren = (item.children?.length ?? 0) > 0;
  const [expanded, setExpanded] = useState(active);

  const baseRow = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors";
  const rowClass = active
    ? `${baseRow} bg-primary-soft text-primary`
    : `${baseRow} text-text-primary hover:bg-primary-soft/60`;

  if (!hasChildren) {
    return (
      <li>
        <Link href={item.href} aria-current={active ? "page" : undefined} className={rowClass}>
          <span className={active ? "text-primary" : "text-text-secondary"}>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`${rowClass} w-full justify-between`}
        aria-expanded={expanded}
      >
        <span className="inline-flex items-center gap-3">
          <span className={active ? "text-primary" : "text-text-secondary"}>{item.icon}</span>
          {item.label}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>
      {expanded && (
        <ul className="mt-1 ml-9 space-y-0.5" role="group">
          {item.children!.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <li key={child.id}>
                <Link
                  href={child.href}
                  aria-current={childActive ? "page" : undefined}
                  className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                    childActive
                      ? "bg-primary-soft text-primary font-medium"
                      : "text-text-secondary hover:text-text-primary hover:bg-primary-soft/50"
                  }`}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
