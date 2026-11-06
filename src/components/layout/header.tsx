"use client";

import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  userName: string;
  userRole: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Header({ title, userName, userRole }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 ml-64 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Left: Page Title */}
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

      {/* Right: Bell + User */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Avatar Dropdown */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{userName}</p>
            <p className="text-xs text-gray-500">{userRole}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-semibold text-white">
            {getInitials(userName)}
          </div>
        </div>
      </div>
    </header>
  );
}
