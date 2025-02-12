"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Calendar,
  Home,
  Settings,
  Sun,
  Moon,
  LogOut,
  Wrench,
  FileText,
  Bot,
  Factory,
  Store,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export function AppSidebar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const items = [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
    },
    {
      title: "SetUp",
      url: "#",
      icon: Wrench,
    },
    {
      title: "Management",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Work Order Management",
      url: "#",
      icon: FileText,
    },
    {
      title: "AI-Chatbot",
      url: "#",
      icon: Bot,
    },
    {
      title: "Inventory Management",
      url: "#",
      icon: Factory,
    },
    {
      title: "Marketplace",
      url: "#",
      icon: Store,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];

  return (
    <Sidebar className="w-64 h-screen bg-gray-100 border-r border-gray-300 shadow-md flex flex-col justify-between">
      {/* Menu Items */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-gray-700 px-4 py-3">
            <div className="flex items-center gap-x-2 mt-14">
              <Image
                src="/forfarm-logo.png"
                width={80}
                height={80}
                alt="ForFarm Logo"
                className="w-24 h-24 rounded-full"
              />

              <h1 className="text-xl">ForFarm</h1>
            </div>
          </SidebarGroupLabel>

          <SidebarGroupContent className="flex flex-col flex-grow justify-center mt-24">
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className={`flex items-center gap-3 my-2 px-4 py-3 rounded-lg text-gray-700 transition duration-300 ${
                          isActive
                            ? "bg-blue-500 text-white font-semibold"
                            : "hover:bg-gray-200"
                        }`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Bottom Section: Theme Toggle & Logout */}
      <div className="p-4 border-t border-gray-300">
        {/* Theme Toggle */}
        <button
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition duration-300 hover:bg-gray-200"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* Logout Button */}
        <button
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-500 transition duration-300 hover:bg-red-100 mt-2"
          onClick={() => alert("Logging out...")} // Replace with actual logout function
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </Sidebar>
  );
}
