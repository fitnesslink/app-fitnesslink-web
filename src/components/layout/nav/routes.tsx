import type { ReactNode } from "react";

// Single source of truth for main-app navigation.
// Mobile TabBar renders the 5 top-level entries; desktop Sidebar also renders
// nested children under collapsible groups (e.g. Catalog → Workouts/Programs/Sessions).

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
  children?: Array<{ id: string; label: string; href: string }>;
}

const iconClass = "w-6 h-6";

const HomeIcon = (
  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12l9-9 9 9" />
    <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
  </svg>
);

const CatalogIcon = (
  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
    <path d="M2 11h20" />
  </svg>
);

const CalendarIcon = (
  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);

const NutritionIcon = (
  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2s6 5 6 11a6 6 0 0 1-12 0c0-6 6-11 6-11z" />
    <path d="M12 11v6" />
  </svg>
);

const ProfileIcon = (
  <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/home", icon: HomeIcon },
  {
    id: "catalog",
    label: "Catalog",
    href: "/catalog",
    icon: CatalogIcon,
    children: [
      { id: "workouts", label: "Workouts", href: "/catalog/workouts" },
      { id: "programs", label: "Programs", href: "/catalog/programs" },
      { id: "sessions", label: "Sessions", href: "/catalog/sessions" },
    ],
  },
  { id: "calendar", label: "Calendar", href: "/calendar", icon: CalendarIcon },
  { id: "nutrition", label: "Nutrition", href: "/nutrition", icon: NutritionIcon },
  { id: "profile", label: "Profile", href: "/profile", icon: ProfileIcon },
];

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (pathname === item.href) return true;
  if (pathname.startsWith(item.href + "/")) return true;
  return item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/")) ?? false;
}
