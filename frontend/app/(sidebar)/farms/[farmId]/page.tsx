// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {
//   ArrowLeft,
//   MapPin,
//   Plus,
//   Sprout,
//   Calendar,
//   LayoutGrid,
//   AlertTriangle,
//   Loader2,
//   Home,
//   ChevronRight,
//   Droplets,
//   Sun,
//   Wind,
// } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { CropDialog } from "./crop-dialog";
// import { CropCard } from "./crop-card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { motion, AnimatePresence } from "framer-motion";
// import type { Farm, Crop } from "@/types";
// import { fetchFarmDetails } from "@/api/farm";

// /**
//  * Used in Next.js; params is now a Promise and must be unwrapped with React.use()
//  */
// interface FarmDetailPageProps {
//   params: Promise<{ farmId: string }>;
// }

// export default function FarmDetailPage({ params }: FarmDetailPageProps) {
//   // Unwrap the promised params using React.use() (experimental)
//   const resolvedParams = React.use(params);

//   const router = useRouter();
//   const [farm, setFarm] = useState<Farm | null>(null);
//   const [crops, setCrops] = useState<Crop[]>([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeFilter, setActiveFilter] = useState<string>("all");

//   // Fetch farm details on initial render using the resolved params
//   useEffect(() => {
//     async function loadFarmDetails() {
//       try {
//         setIsLoading(true);
//         setError(null);
//         const { farm, crops } = await fetchFarmDetails(resolvedParams.farmId);
//         setFarm(farm);
//         setCrops(crops);
//       } catch (err) {
//         if (err instanceof Error) {
//           if (err.message === "FARM_NOT_FOUND") {
//             router.push("/not-found");
//             return;
//           }
//           setError(err.message);
//         } else {
//           setError("An unknown error occurred");
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     loadFarmDetails();
//   }, [resolvedParams.farmId, router]);

//   /**
//    * Handles adding a new crop.
//    */
//   const handleAddCrop = async (data: Partial<Crop>) => {
//     try {
//       // Simulate API delay
//       await new Promise((resolve) => setTimeout(resolve, 800));

//       const newCrop: Crop = {
//         id: Math.random().toString(36).substr(2, 9),
//         farmId: farm!.id,
//         name: data.name!,
//         plantedDate: data.plantedDate!,
//         status: data.status!,
//         variety: data.variety || "Standard",
//         area: data.area || "0 hectares",
//         healthScore: data.status === "growing" ? 85 : 0,
//         progress: data.status === "growing" ? 10 : 0,
//       };

//       setCrops((prev) => [newCrop, ...prev]);

//       // Update the farm's crop count
//       if (farm) {
//         setFarm({ ...farm, crops: farm.crops + 1 });
//       }

//       setIsDialogOpen(false);
//     } catch (err) {
//       setError("Failed to add crop. Please try again.");
//     }
//   };

//   // Filter crops based on the active filter
//   const filteredCrops = crops.filter((crop) => activeFilter === "all" || crop.status === activeFilter);

//   // Calculate crop counts grouped by status
//   const cropCounts = {
//     all: crops.length,
//     growing: crops.filter((crop) => crop.status === "growing").length,
//     planned: crops.filter((crop) => crop.status === "planned").length,
//     harvested: crops.filter((crop) => crop.status === "harvested").length,
//   };

//   return (
//     <div className="min-h-screen bg-background text-foreground">
//       <div className="container max-w-7xl p-6 mx-auto">
//         <div className="flex flex-col gap-6">
//           {/* Breadcrumbs */}
//           <nav className="flex items-center text-sm text-muted-foreground">
//             <Button
//               variant="link"
//               className="p-0 h-auto font-normal text-muted-foreground"
//               onClick={() => router.push("/")}>
//               <Home className="h-3.5 w-3.5 mr-1" />
//               Home
//             </Button>
//             <ChevronRight className="h-3.5 w-3.5 mx-1" />
//             <Button
//               variant="link"
//               className="p-0 h-auto font-normal text-muted-foreground"
//               onClick={() => router.push("/farms")}>
//               Farms
//             </Button>
//             <ChevronRight className="h-3.5 w-3.5 mx-1" />
//             <span className="text-foreground font-medium truncate">{farm?.name || "Farm Details"}</span>
//           </nav>

//           {/* Back button */}
//           <Button
//             variant="outline"
//             size="sm"
//             className="w-fit gap-2 text-muted-foreground"
//             onClick={() => router.push("/farms")}>
//             <ArrowLeft className="h-4 w-4" /> Back to Farms
//           </Button>

//           {/* Error state */}
//           {error && (
//             <Alert variant="destructive">
//               <AlertTriangle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}

//           {/* Loading state */}
//           {isLoading && (
//             <div className="flex flex-col items-center justify-center py-12">
//               <Loader2 className="h-8 w-8 text-green-600 animate-spin mb-4" />
//               <p className="text-muted-foreground">Loading farm details...</p>
//             </div>
//           )}

//           {/* Farm details */}
//           {!isLoading && !error && farm && (
//             <>
//               <div className="grid gap-6 md:grid-cols-12">
//                 {/* Farm info card */}
//                 <Card className="md:col-span-8">
//                   <CardHeader className="pb-2">
//                     <div className="flex items-center justify-between">
//                       <Badge
//                         variant="outline"
//                         className="capitalize bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200">
//                         {farm.type}
//                       </Badge>
//                       <div className="flex items-center text-sm text-muted-foreground">
//                         <Calendar className="h-4 w-4 mr-1" />
//                         Created {farm.createdAt.toLocaleDateString()}
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-4 mt-2">
//                       <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
//                         <Sprout className="h-6 w-6 text-green-600 dark:text-green-300" />
//                       </div>
//                       <div>
//                         <h1 className="text-2xl font-bold">{farm.name}</h1>
//                         <div className="flex items-center text-muted-foreground mt-1">
//                           <MapPin className="h-4 w-4 mr-1" />
//                           {farm.location}
//                         </div>
//                       </div>
//                     </div>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
//                       <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3">
//                         <p className="text-xs text-muted-foreground">Total Area</p>
//                         <p className="text-lg font-semibold">{farm.area}</p>
//                       </div>
//                       <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3">
//                         <p className="text-xs text-muted-foreground">Total Crops</p>
//                         <p className="text-lg font-semibold">{farm.crops}</p>
//                       </div>
//                       <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3">
//                         <p className="text-xs text-muted-foreground">Growing Crops</p>
//                         <p className="text-lg font-semibold">{cropCounts.growing}</p>
//                       </div>
//                       <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3">
//                         <p className="text-xs text-muted-foreground">Harvested</p>
//                         <p className="text-lg font-semibold">{cropCounts.harvested}</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Weather card */}
//                 <Card className="md:col-span-4">
//                   <CardHeader>
//                     <CardTitle className="text-lg">Current Conditions</CardTitle>
//                     <CardDescription>Weather at your farm location</CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="flex items-start gap-2">
//                         <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900">
//                           <Sun className="h-4 w-4 text-orange-500 dark:text-orange-200" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-muted-foreground">Temperature</p>
//                           <p className="text-xl font-semibold">{farm.weather?.temperature}°C</p>
//                         </div>
//                       </div>
//                       <div className="flex items-start gap-2">
//                         <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900">
//                           <Droplets className="h-4 w-4 text-blue-500 dark:text-blue-200" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-muted-foreground">Humidity</p>
//                           <p className="text-xl font-semibold">{farm.weather?.humidity}%</p>
//                         </div>
//                       </div>
//                       <div className="flex items-start gap-2">
//                         <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900">
//                           <Sun className="h-4 w-4 text-yellow-500 dark:text-yellow-200" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-muted-foreground">Sunlight</p>
//                           <p className="text-xl font-semibold">{farm.weather?.sunlight}%</p>
//                         </div>
//                       </div>
//                       <div className="flex items-start gap-2">
//                         <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
//                           <Wind className="h-4 w-4 text-gray-500 dark:text-gray-300" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-muted-foreground">Rainfall</p>
//                           <p className="text-xl font-semibold">{farm.weather?.rainfall}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Crops section */}
//               <div className="mt-4">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
//                   <div>
//                     <h2 className="text-xl font-bold flex items-center">
//                       <LayoutGrid className="h-5 w-5 mr-2 text-green-600 dark:text-green-300" />
//                       Crops
//                     </h2>
//                     <p className="text-sm text-muted-foreground">Manage and monitor all crops in this farm</p>
//                   </div>
//                   <Button
//                     onClick={() => setIsDialogOpen(true)}
//                     className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto">
//                     <Plus className="h-4 w-4" />
//                     Add New Crop
//                   </Button>
//                 </div>

//                 <Tabs defaultValue="all" className="mt-6">
//                   <TabsList>
//                     <TabsTrigger value="all" onClick={() => setActiveFilter("all")}>
//                       All Crops ({cropCounts.all})
//                     </TabsTrigger>
//                     <TabsTrigger value="growing" onClick={() => setActiveFilter("growing")}>
//                       Growing ({cropCounts.growing})
//                     </TabsTrigger>
//                     <TabsTrigger value="planned" onClick={() => setActiveFilter("planned")}>
//                       Planned ({cropCounts.planned})
//                     </TabsTrigger>
//                     <TabsTrigger value="harvested" onClick={() => setActiveFilter("harvested")}>
//                       Harvested ({cropCounts.harvested})
//                     </TabsTrigger>
//                   </TabsList>

//                   <TabsContent value="all" className="mt-6">
//                     {filteredCrops.length === 0 ? (
//                       <div className="flex flex-col items-center justify-center py-12 bg-muted/20 dark:bg-muted/30 rounded-lg border border-dashed">
//                         <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-4">
//                           <Sprout className="h-6 w-6 text-green-600 dark:text-green-300" />
//                         </div>
//                         <h3 className="text-xl font-medium mb-2">No crops found</h3>
//                         <p className="text-muted-foreground text-center max-w-md mb-6">
//                           {activeFilter === "all"
//                             ? "You haven't added any crops to this farm yet."
//                             : `No ${activeFilter} crops found. Try a different filter.`}
//                         </p>
//                         <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
//                           <Plus className="h-4 w-4" />
//                           Add your first crop
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                         <AnimatePresence>
//                           {filteredCrops.map((crop, index) => (
//                             <motion.div
//                               key={crop.id}
//                               initial={{ opacity: 0, y: 20 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               exit={{ opacity: 0, y: -20 }}
//                               transition={{ duration: 0.2, delay: index * 0.05 }}>
//                               <CropCard
//                                 crop={crop}
//                                 onClick={() => router.push(`/farms/${crop.farmId}/crops/${crop.id}`)}
//                               />
//                             </motion.div>
//                           ))}
//                         </AnimatePresence>
//                       </div>
//                     )}
//                   </TabsContent>

//                   {/* Growing tab */}
//                   <TabsContent value="growing" className="mt-6">
//                     {filteredCrops.length === 0 ? (
//                       <div className="flex flex-col items-center justify-center py-12 bg-muted/20 dark:bg-muted/30 rounded-lg border border-dashed">
//                         <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-4">
//                           <Sprout className="h-6 w-6 text-green-600 dark:text-green-300" />
//                         </div>
//                         <h3 className="text-xl font-medium mb-2">No growing crops</h3>
//                         <p className="text-muted-foreground text-center max-w-md mb-6">
//                           You don't have any growing crops in this farm yet.
//                         </p>
//                         <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
//                           <Plus className="h-4 w-4" />
//                           Add a growing crop
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                         <AnimatePresence>
//                           {filteredCrops.map((crop, index) => (
//                             <motion.div
//                               key={crop.id}
//                               initial={{ opacity: 0, y: 20 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               exit={{ opacity: 0, y: -20 }}
//                               transition={{ duration: 0.2, delay: index * 0.05 }}>
//                               <CropCard
//                                 crop={crop}
//                                 onClick={() => router.push(`/farms/${crop.farmId}/crops/${crop.id}`)}
//                               />
//                             </motion.div>
//                           ))}
//                         </AnimatePresence>
//                       </div>
//                     )}
//                   </TabsContent>

//                   {/* Planned tab */}
//                   <TabsContent value="planned" className="mt-6">
//                     {filteredCrops.length === 0 ? (
//                       <div className="flex flex-col items-center justify-center py-12 bg-muted/20 dark:bg-muted/30 rounded-lg border border-dashed">
//                         <h3 className="text-xl font-medium mb-2">No planned crops</h3>
//                         <p className="text-muted-foreground text-center max-w-md mb-6">
//                           You don't have any planned crops in this farm yet.
//                         </p>
//                         <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
//                           <Plus className="h-4 w-4" />
//                           Plan a new crop
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                         <AnimatePresence>
//                           {filteredCrops.map((crop, index) => (
//                             <motion.div
//                               key={crop.id}
//                               initial={{ opacity: 0, y: 20 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               exit={{ opacity: 0, y: -20 }}
//                               transition={{ duration: 0.2, delay: index * 0.05 }}>
//                               <CropCard
//                                 crop={crop}
//                                 onClick={() => router.push(`/farms/${crop.farmId}/crops/${crop.id}`)}
//                               />
//                             </motion.div>
//                           ))}
//                         </AnimatePresence>
//                       </div>
//                     )}
//                   </TabsContent>

//                   {/* Harvested tab */}
//                   <TabsContent value="harvested" className="mt-6">
//                     {filteredCrops.length === 0 ? (
//                       <div className="flex flex-col items-center justify-center py-12 bg-muted/20 dark:bg-muted/30 rounded-lg border border-dashed">
//                         <h3 className="text-xl font-medium mb-2">No harvested crops</h3>
//                         <p className="text-muted-foreground text-center max-w-md mb-6">
//                           You don't have any harvested crops in this farm yet.
//                         </p>
//                         <Button onClick={() => setActiveFilter("all")} className="gap-2">
//                           View all crops
//                         </Button>
//                       </div>
//                     ) : (
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                         <AnimatePresence>
//                           {filteredCrops.map((crop, index) => (
//                             <motion.div
//                               key={crop.id}
//                               initial={{ opacity: 0, y: 20 }}
//                               animate={{ opacity: 1, y: 0 }}
//                               exit={{ opacity: 0, y: -20 }}
//                               transition={{ duration: 0.2, delay: index * 0.05 }}>
//                               <CropCard
//                                 crop={crop}
//                                 onClick={() => router.push(`/farms/${crop.farmId}/crops/${crop.id}`)}
//                               />
//                             </motion.div>
//                           ))}
//                         </AnimatePresence>
//                       </div>
//                     )}
//                   </TabsContent>
//                 </Tabs>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Add Crop Dialog */}
//       <CropDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSubmit={handleAddCrop} />
//     </div>
//   );
// }

export default function FarmDetailPage({ params }: FarmDetailPageProps) {
  return <div>hello</div>;
}
