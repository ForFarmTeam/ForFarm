"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, SlidersHorizontal, Leaf, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { FarmCard } from "./farm-card";
import { AddFarmForm } from "./add-farm-form";
import type { Farm } from "@/types";
import { fetchFarms, createFarm } from "@/api/farm";

export default function FarmSetupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "alphabetical">("newest");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: farms,
    isLoading,
    isError,
    error,
  } = useQuery<Farm[]>({
    queryKey: ["farms"],
    queryFn: fetchFarms,
    staleTime: 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<Farm>) => createFarm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      setIsDialogOpen(false);
    },
  });

  // export interface Farm {
  //   CreatedAt: string;
  //   FarmType: string;
  //   Lat: number;
  //   Lon: number;
  //   Name: string;
  //   OwnerID: string;
  //   TotalSize: string;
  //   UUID: string;
  //   UpdatedAt: string;
  // }

  const filteredAndSortedFarms = (farms || [])
    .filter(
      (farm) =>
        (activeFilter === "all" || farm.FarmType === activeFilter) &&
        (farm.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          // farm.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          farm.FarmType.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
      } else if (sortOrder === "oldest") {
        return new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime();
      } else {
        return a.Name.localeCompare(b.Name);
      }
    });

  // Get distinct farm types.
  const farmTypes = ["all", ...new Set((farms || []).map((farm) => farm.FarmType))];

  const handleAddFarm = async (data: Partial<Farm>) => {
    await mutation.mutateAsync(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b">
      <div className="container max-w-7xl p-6 mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Farms</h1>
              <p className="text-muted-foreground mt-1">Manage and monitor all your agricultural properties</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search farms..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Add Farm
              </Button>
            </div>
          </div>

          {/* Filtering and sorting controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {farmTypes.map((type) => (
                <Badge
                  key={type}
                  variant={activeFilter === type ? "default" : "outline"}
                  className={`capitalize cursor-pointer ${
                    activeFilter === type ? "bg-green-600" : "hover:bg-green-100"
                  }`}
                  onClick={() => setActiveFilter(type)}>
                  {type === "all" ? "All Farms" : type}
                </Badge>
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className={sortOrder === "newest" ? "bg-green-50" : ""}
                  onClick={() => setSortOrder("newest")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Newest first
                  {sortOrder === "newest" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === "oldest" ? "bg-green-50" : ""}
                  onClick={() => setSortOrder("oldest")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Oldest first
                  {sortOrder === "oldest" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === "alphabetical" ? "bg-green-50" : ""}
                  onClick={() => setSortOrder("alphabetical")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Alphabetical
                  {sortOrder === "alphabetical" && <Check className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator className="my-2" />

          {/* Error state */}
          {isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{(error as Error)?.message}</AlertDescription>
            </Alert>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your farms...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && filteredAndSortedFarms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 bg-muted/20 rounded-lg border border-dashed">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">No farms found</h3>
              {searchQuery || activeFilter !== "all" ? (
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  No farms match your current filters. Try adjusting your search or filters.
                </p>
              ) : (
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  You haven&apos;t added any farms yet. Get started by adding your first farm.
                </p>
              )}
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                  if (!farms || farms.length === 0) {
                    setIsDialogOpen(true);
                  }
                }}
                className="gap-2">
                {searchQuery || activeFilter !== "all" ? (
                  "Clear filters"
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add your first farm
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Grid of farm cards */}
          {!isLoading && !isError && filteredAndSortedFarms.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="col-span-1">
                  <FarmCard variant="add" onClick={() => setIsDialogOpen(true)} />
                </motion.div>
                {filteredAndSortedFarms.map((farm, index) => (
                  <motion.div
                    key={farm.UUID}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="col-span-1">
                    <FarmCard variant="farm" farm={farm} onClick={() => router.push(`/farms/${farm.UUID}`)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Add Farm Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Farm</DialogTitle>
            <DialogDescription>Fill out the details below to add a new farm to your account.</DialogDescription>
          </DialogHeader>
          <AddFarmForm onSubmit={handleAddFarm} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * A helper component for the Check icon.
 */
function Check({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
