"use client";

import { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface CropItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface NavCropsProps {
  crops: CropItem[];
  title?: string;
}

export function NavCrops({ crops, title = "Crops" }: NavCropsProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {crops.map((crop) => (
            <SidebarMenuItem key={crop.title}>
              <SidebarMenuButton asChild>
                <a href={crop.url}>
                  <crop.icon />
                  <span>{crop.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
