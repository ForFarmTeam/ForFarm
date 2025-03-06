"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  User,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { NavCrops } from "./nav-crops";
import { fetchUserMe } from "@/api/user";

interface Team {
  name: string;
  logo: React.ComponentType;
  plan: string;
}

import { LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface SidebarConfig {
  teams: Team[];
  navMain: NavItem[];
  crops: NavItem[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  config?: SidebarConfig;
}

export function AppSidebar({ config, ...props }: AppSidebarProps) {
  const defaultConfig: SidebarConfig = {
    teams: [
      { name: "Farm 1", logo: GalleryVerticalEnd, plan: "Hatyai" },
      { name: "Farm 2", logo: AudioWaveform, plan: "Songkla" },
      { name: "Farm 3", logo: Command, plan: "Layong" },
    ],
    navMain: [
      { title: "Farms", url: "/farms", icon: Map },
      { title: "Crops list", url: "/crops", icon: Frame },
      { title: "Inventory", url: "/inventory", icon: SquareTerminal },
      { title: "Marketplace Information", url: "/marketplace", icon: PieChart },
      { title: "Knowledge Hub", url: "/knowledge", icon: BookOpen },
      { title: "Users", url: "/users", icon: User },
      { title: "AI Chatbot", url: "/chatbot", icon: Bot },
      { title: "Settings", url: "/settings", icon: Settings2 },
    ],
    // Define crops with dynamic URLs – replace [farmId] with your actual farm identifier as needed.
    crops: [
      { title: "Crops 1", url: "/farms/[farmId]/crops/1", icon: Map },
      { title: "Crops 2", url: "/farms/[farmId]/crops/2", icon: Map },
      { title: "Crops 3", url: "/farms/[farmId]/crops/3", icon: Map },
    ],
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
        setUser({
          name: data.user.UUID,
          email: data.user.Email,
          avatar: data.user.Avatar || "/avatars/avatar.webp",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    getUser();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarConfig.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarConfig.navMain} />
        <div className="mt-6">
          <NavCrops crops={sidebarConfig.crops} />
        </div>
      </SidebarContent>
      <SidebarFooter>{loading ? "Loading..." : error ? error : <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
