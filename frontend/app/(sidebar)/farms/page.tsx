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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { FarmCard } from "./farm-card";
import { AddFarmForm } from "./add-farm-form";
import { EditFarmForm } from "./edit-farm-form";
import type { Farm } from "@/types";
import { fetchFarms, createFarm, updateFarm, deleteFarm } from "@/api/farm";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FarmSetupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "alphabetical">("newest");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State for edit dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete dialog
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null); // Farm to edit/delete

  // --- Fetch Farms ---
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

  // --- Create Farm Mutation ---
  const createMutation = useMutation({
    mutationFn: (data: Partial<Omit<Farm, "uuid" | "createdAt" | "updatedAt" | "crops" | "ownerId">>) =>
      createFarm(data),
    onSuccess: (newFarm) => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      setIsAddDialogOpen(false);
      toast.success(`Farm "${newFarm.name}" created successfully!`);
    },
    onError: (error) => {
      toast.error(`Failed to create farm: ${(error as Error).message}`);
    },
  });

  // --- Update Farm Mutation ---
  const updateMutation = useMutation({
    mutationFn: (data: {
      farmId: string;
      payload: Partial<Omit<Farm, "uuid" | "createdAt" | "updatedAt" | "crops" | "ownerId">>;
    }) => updateFarm(data.farmId, data.payload),
    onSuccess: (updatedFarm) => {
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      setIsEditDialogOpen(false);
      setSelectedFarm(null);
      toast.success(`Farm "${updatedFarm.name}" updated successfully!`);
    },
    onError: (error) => {
      toast.error(`Failed to update farm: ${(error as Error).message}`);
    },
  });

  // --- Delete Farm Mutation ---
  const deleteMutation = useMutation({
    mutationFn: (farmId: string) => deleteFarm(farmId),
    onSuccess: (_, farmId) => {
      // Second arg is the variable passed to mutate
      queryClient.invalidateQueries({ queryKey: ["farms"] });
      // Optionally remove specific farm query if cached elsewhere: queryClient.removeQueries({ queryKey: ["farm", farmId] });
      setIsDeleteDialogOpen(false);
      setSelectedFarm(null);
      toast.success(`Farm deleted successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to delete farm: ${(error as Error).message}`);
      setIsDeleteDialogOpen(false); // Close dialog even on error
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

  const handleAddFarmSubmit = async (data: Partial<Farm>) => {
    await createMutation.mutateAsync(data);
  };

  const handleEditFarmSubmit = async (
    data: Partial<Omit<Farm, "uuid" | "createdAt" | "updatedAt" | "crops" | "ownerId">>
  ) => {
    if (!selectedFarm) return;
    await updateMutation.mutateAsync({ farmId: selectedFarm.uuid, payload: data });
  };

  const openEditDialog = (farm: Farm, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setSelectedFarm(farm);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (farm: Farm, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setSelectedFarm(farm);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedFarm) return;
    deleteMutation.mutate(selectedFarm.uuid);
  };

  // --- Filtering and Sorting Logic ---
  const filteredAndSortedFarms = (farms || [])
    .filter(
      (farm) =>
        (activeFilter === "all" || farm.farmType === activeFilter) && // Use camelCase farmType
        (farm.name.toLowerCase().includes(searchQuery.toLowerCase()) || // Use camelCase name
          // farm.location is no longer a single string, use lat/lon if needed for search
          farm.farmType.toLowerCase().includes(searchQuery.toLowerCase())) // Use camelCase farmType
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Use camelCase createdAt
      } else if (sortOrder === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Use camelCase createdAt
      } else {
        return a.name.localeCompare(b.name); // Use camelCase name
      }
    });

  // Get distinct farm types.
  const farmTypes = ["all", ...new Set((farms || []).map((farm) => farm.farmType))]; // Use camelCase farmType

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
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
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
                  className={`capitalize cursor-pointer rounded-full px-3 py-1 text-sm ${
                    // Made rounded-full
                    activeFilter === type ? "bg-primary text-primary-foreground" : "hover:bg-accent" // Adjusted colors
                  }`}
                  onClick={() => setActiveFilter(type)}>
                  {type === "all" ? "All Farms" : type}
                </Badge>
              ))}
            </div>
            {/* DropdownMenu remains the same, Check icon was missing */}
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
                  className={sortOrder === "newest" ? "bg-accent" : ""} // Use accent for selection
                  onClick={() => setSortOrder("newest")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Newest first
                  {sortOrder === "newest" && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === "oldest" ? "bg-accent" : ""}
                  onClick={() => setSortOrder("oldest")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Oldest first
                  {sortOrder === "oldest" && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={sortOrder === "alphabetical" ? "bg-accent" : ""}
                  onClick={() => setSortOrder("alphabetical")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Alphabetical
                  {sortOrder === "alphabetical" && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator className="my-2" />

          {/* Error state */}
          {isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Farms</AlertTitle>
              <AlertDescription>{(error as Error)?.message}</AlertDescription>
            </Alert>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map(
                (
                  _,
                  i // Render skeleton cards
                ) => (
                  <Card key={i} className="w-full h-[250px]">
                    <CardHeader className="p-4 pb-0">
                      <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Skeleton className="h-8 w-24 ml-auto" />
                    </CardFooter>
                  </Card>
                )
              )}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && filteredAndSortedFarms.length === 0 && (
            // ... (Empty state remains the same) ...
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
                  You haven't added any farms yet. Get started by adding your first farm.
                </p>
              )}
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                  if (!farms || farms.length === 0) {
                    setIsAddDialogOpen(true);
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
                {/* Add Farm Card */}
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}>
                  <FarmCard variant="add" onClick={() => setIsAddDialogOpen(true)} />
                </motion.div>
                {/* Existing Farm Cards */}
                {filteredAndSortedFarms.map((farm, index) => (
                  <motion.div
                    layout // Add layout animation
                    key={farm.uuid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="col-span-1">
                    <FarmCard
                      variant="farm"
                      farm={farm}
                      onClick={() => router.push(`/farms/${farm.uuid}`)}
                      onEditClick={(e) => openEditDialog(farm, e)} // Pass handler
                      onDeleteClick={(e) => openDeleteDialog(farm, e)} // Pass handler
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Add Farm Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] xl:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Add New Farm</DialogTitle>
            <DialogDescription>Fill out the details below to add a new farm to your account.</DialogDescription>
          </DialogHeader>
          <AddFarmForm onSubmit={handleAddFarmSubmit} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Farm Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] xl:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Edit Farm: {selectedFarm?.name}</DialogTitle>
            <DialogDescription>Update the details for this farm.</DialogDescription>
          </DialogHeader>
          {/* Create or use an EditFarmForm component */}
          {selectedFarm && (
            <EditFarmForm
              initialData={selectedFarm}
              onSubmit={handleEditFarmSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={updateMutation.isPending} // Pass submitting state
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the farm "{selectedFarm?.name}" and all
              associated crops and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Farm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
