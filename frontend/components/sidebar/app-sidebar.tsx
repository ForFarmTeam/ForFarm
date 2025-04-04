"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings,
  SquareTerminal,
  UserCircle,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
// import { NavCrops } from "./nav-crops";
import { fetchUserMe } from "@/api/user";
import { usePathname } from "next/navigation";

interface Team {
  name: string;
  logo: React.ComponentType<{ className?: string }>; // Ensure logo type accepts className
  plan: string;
}

import { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean; // Add isActive property
}

interface SidebarConfig {
  teams: Team[];
  navMain: NavItem[];
  // crops: NavItem[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  config?: SidebarConfig;
}

function UserSkeleton() {
  return (
    <div className="flex items-center space-x-2 animate-pulse">
      <div className="w-8 h-8 bg-gray-300 rounded-full" />
      <div className="w-24 h-4 bg-gray-300 rounded" />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function UserErrorFallback({ message }: { message: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-red-300 rounded-full flex items-center justify-center">
        <span role="img" aria-label="error">
          ⚠️
        </span>
      </div>
      <div className="text-sm text-red-600">Failed to load user</div>
    </div>
  );
}

const defaultNavMain: NavItem[] = [
  { title: "Farms", url: "/farms", icon: Map },
  { title: "Inventory", url: "/inventory", icon: SquareTerminal },
  { title: "Marketplace", url: "/marketplace", icon: PieChart }, // Updated title and icon
  { title: "Knowledge Hub", url: "/hub", icon: BookOpen },
  { title: "AI Chatbot", url: "/chatbot", icon: Bot },
  { title: "Profile", url: "/profile", icon: UserCircle }, // Added Profile
  { title: "Settings", url: "/settings", icon: Settings }, // Kept Settings
];

export function AppSidebar({ config, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const defaultConfig: SidebarConfig = {
    teams: [
      { name: "Farm 1", logo: GalleryVerticalEnd, plan: "Hatyai" },
      { name: "Farm 2", logo: AudioWaveform, plan: "Songkla" },
      { name: "Farm 3", logo: Command, plan: "Layong" },
    ],
    navMain: defaultNavMain.map((item) => ({
      ...item,
      isActive: pathname.startsWith(item.url) && (item.url !== "/" || pathname === "/"),
    })),
  };

  // Allow external configuration override
  const sidebarConfig = config || defaultConfig;

  const [user, setUser] = useState<{ name: string; email: string; avatar: string }>({
    name: "",
    email: "",
    avatar: "/avatars/avatar.webp",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getUser() {
      try {
        const data = await fetchUserMe();
        console.log("Fetched user data:", data);
        setUser({
          name: data.user.username || data.user.email.split("@")[0] || `User ${data.user.uuid.substring(0, 6)}`,
          email: data.user.email,
          avatar: data.user.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${data.user.email}`,
        });
      } catch (err: unknown) {
        console.error("Failed to fetch user for sidebar:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred fetching user data");
        }
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {loading ? <UserSkeleton /> : error ? <UserErrorFallback message={error} /> : <NavUser user={user} />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarConfig.navMain} />
      </SidebarContent>
      {/* <SidebarFooter>
        {loading ? <UserSkeleton /> : error ? <UserErrorFallback message={error} /> : <NavUser user={user} />}
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
