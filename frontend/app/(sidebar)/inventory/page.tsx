"use client";

import { useState } from "react";
import { Calendar, ChevronDown, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

export default function InventoryPage() {
  const [date, setDate] = useState<Date>();
  const [inventoryType, setInventoryType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Sample inventory data
  const inventoryItems = [
    {
      id: 1,
      name: "Tomato Seeds",
      category: "Seeds",
      type: "Plantation",
      quantity: 500,
      unit: "packets",
      lastUpdated: "2023-03-01",
      status: "In Stock",
    },
    {
      id: 2,
      name: "NPK Fertilizer",
      category: "Fertilizer",
      type: "Fertilizer",
      quantity: 200,
      unit: "kg",
      lastUpdated: "2023-03-05",
      status: "Low Stock",
    },
    {
      id: 3,
      name: "Corn Seeds",
      category: "Seeds",
      type: "Plantation",
      quantity: 300,
      unit: "packets",
      lastUpdated: "2023-03-10",
      status: "In Stock",
    },
    {
      id: 4,
      name: "Organic Compost",
      category: "Fertilizer",
      type: "Fertilizer",
      quantity: 150,
      unit: "kg",
      lastUpdated: "2023-03-15",
      status: "In Stock",
    },
    {
      id: 5,
      name: "Wheat Seeds",
      category: "Seeds",
      type: "Plantation",
      quantity: 250,
      unit: "packets",
      lastUpdated: "2023-03-20",
      status: "In Stock",
    },
  ];

  // Filter items based on selected type
  const filteredItems =
    inventoryType === "all"
      ? inventoryItems
      : inventoryItems.filter((item) =>
          inventoryType === "plantation" ? item.type === "Plantation" : item.type === "Fertilizer"
        );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold tracking-tight mb-6">Inventory</h1>

          {/* Filters and search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={inventoryType === "all" ? "default" : "outline"}
                onClick={() => setInventoryType("all")}
                className="w-24">
                All
              </Button>
              <Select value={inventoryType} onValueChange={setInventoryType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="plantation">Plantation</SelectItem>
                    <SelectItem value="fertilizer">Fertilizer</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-1 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-between">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? date.toLocaleDateString() : "Time filter"}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>

              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search Farms" className="pl-8" />
              </div>

              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-md">
            <h3 className="px-4 py-2 border-b font-medium">Table Fields</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>{item.lastUpdated}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "Low Stock" ? "destructive" : "default"}>{item.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
    </div>
  );
}
