"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Newspaper, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "탐험",
    icon: Map,
  },
  {
    href: "/feed",
    label: "피드",
    icon: Newspaper,
  },
  {
    href: "/profile",
    label: "프로필",
    icon: User,
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-cream">
      <div className="max-w-screen-md mx-auto px-4">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-6 py-2 transition-colors",
                    isActive
                      ? "text-brown"
                      : "text-gray-500 hover:text-brown"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      isActive && "fill-brown"
                    )}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
