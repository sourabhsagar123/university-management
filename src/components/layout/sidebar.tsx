"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  UserPlus,
  FileText,
  BarChart3,
  ClipboardList,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  role: "ADMIN" | "FACULTY" | "STUDENT";
  userName: string;
  userEmail: string;
}

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Faculty", href: "/admin/faculty", icon: GraduationCap },
  { label: "Departments", href: "/admin/departments", icon: Building2 },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Offerings", href: "/admin/offerings", icon: Calendar },
  { label: "Enrollments", href: "/admin/enrollments", icon: UserPlus },
  { label: "Examinations", href: "/admin/examinations", icon: FileText },
  { label: "Results", href: "/admin/results", icon: BarChart3 },
  { label: "Reports", href: "/admin/reports", icon: ClipboardList },
];

const facultyNavItems: NavItem[] = [
  { label: "Dashboard", href: "/faculty", icon: LayoutDashboard },
  { label: "My Courses", href: "/faculty/courses", icon: BookOpen },
  { label: "Students", href: "/faculty/students", icon: Users },
  { label: "Enter Marks", href: "/faculty/marks", icon: FileText },
  { label: "Results", href: "/faculty/results", icon: BarChart3 },
];

const studentNavItems: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "My Courses", href: "/student/courses", icon: BookOpen },
  { label: "Results", href: "/student/results", icon: BarChart3 },
  { label: "Profile", href: "/student/profile", icon: Users },
];

const navItemsByRole: Record<string, NavItem[]> = {
  ADMIN: adminNavItems,
  FACULTY: facultyNavItems,
  STUDENT: studentNavItems,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[role] || [];

  const isActive = (href: string) => {
    if (href === `/${role.toLowerCase()}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#1e3a5f]">
      {/* Logo Area */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-lg font-bold text-white">
          CU
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">
            Chandigarh University
          </h1>
          <p className="text-xs text-white/70">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info Section */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
            {getInitials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {userName}
            </p>
            <span className="inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90">
              {role}
            </span>
          </div>
        </div>
        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
