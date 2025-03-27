"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DynamicBreadcrumb from "./dynamic-breadcrumb";
import { extractRoute } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import { useForm, FormProvider } from "react-hook-form";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const currentPathname = extractRoute(pathname);
  const form = useForm();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <FormProvider {...form}>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <ThemeToggle />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb pathname={currentPathname} />
            </div>
          </header>
          {children}
          <Toaster />
        </FormProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
