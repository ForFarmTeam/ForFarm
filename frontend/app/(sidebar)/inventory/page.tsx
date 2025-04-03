"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TriangleAlertIcon } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search } from "lucide-react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { fetchHarvestUnits } from "@/api/harvest";

import { Badge } from "@/components/ui/badge";
import {
  fetchInventoryItems,
  fetchInventoryStatus,
  fetchInventoryCategory,
} from "@/api/inventory";
import { AddInventoryItem } from "./add-inventory-item";
import {
  EditInventoryItem,
  EditInventoryItemProps,
} from "./edit-inventory-item";
import { DeleteInventoryItem } from "./delete-inventory-item";

export default function InventoryPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  //////////////////////////////
  // query the necessary data for edit and etc.
  const {
    data: inventoryItems = [],
    isLoading: isItemLoading,
    isError: isItemError,
  } = useQuery({
    queryKey: ["inventoryItems"],
    queryFn: fetchInventoryItems,
    staleTime: 60 * 1000,
  });

  const {
    data: inventoryStatus = [],
    isLoading: isLoadingStatus,
    isError: isErrorStatus,
  } = useQuery({
    queryKey: ["inventoryStatus"],
    queryFn: fetchInventoryStatus,
    staleTime: 60 * 1000,
  });
  const {
    data: inventoryCategory = [],
    isLoading: isLoadingCategory,
    isError: isErrorCategory,
  } = useQuery({
    queryKey: ["inventoryCategory"],
    queryFn: fetchInventoryCategory,
    staleTime: 60 * 1000,
  });
  const {
    data: harvestUnits = [],
    isLoading: isLoadingHarvestUnits,
    isError: isErrorHarvestUnits,
  } = useQuery({
    queryKey: ["harvestUnits"],
    queryFn: fetchHarvestUnits,
    staleTime: 60 * 1000,
  });
  //////////////////////////////
  // console.table(inventoryItems);
  // console.table(inventoryStatus);
  // console.table(harvestUnits);

  const [searchTerm, setSearchTerm] = useState("");
  const filteredItems = useMemo(() => {
    return inventoryItems
      .map((item) => ({
        ...item,
        status:
          inventoryStatus.find(
            (statusItem) => statusItem.id.toString() === item.statusId.toString()
          )?.name || "",
        category:
          inventoryCategory.find(
            (categoryItem) =>
              categoryItem.id.toString() === item.categoryId.toString()
          )?.name || "",
        categoryId: item.categoryId.toString(),
        unit:
          harvestUnits.find((unit) => unit.id === item.unitId)
            ?.name || "",
        unitId: item.unitId.toString(),
        statusId: item.statusId.toString(),
        fetchedInventoryStatus: inventoryStatus,
        fetchedInventoryCategory: inventoryCategory,
        fetchedHarvestUnits: harvestUnits,
      }))
      .filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [inventoryItems, searchTerm]);

  //  prepare columns for table

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "unit", header: "Unit" },
    { accessorKey: "lastUpdated", header: "Last Updated" },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: { getValue: () => string }) => {
        const status = info.getValue();

        let statusClass = ""; // default status class

        if (status === "Low Stock") {
          statusClass = "bg-yellow-300"; // yellow for low stock
        } else if (status === "Out Of Stock") {
          statusClass = "bg-red-500 text-white"; // red for out of stock
        }

        return (
          <Badge className={`py-1 px-2 rounded-md ${statusClass}`}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "edit",
      header: "Edit",
      cell: ({ row }: { row: { original: EditInventoryItemProps } }) => (
        <EditInventoryItem
          {...row.original}
          fetchedInventoryStatus={inventoryStatus}
          fetchedInventoryCategory={inventoryCategory}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "delete",
      header: "Delete",
      cell: ({ row }: { row: { original: EditInventoryItemProps } }) => (
        <DeleteInventoryItem id={row.original.id} />
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: filteredItems,
    columns,
    state: { sorting, pagination },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });
  const loadingStates = [
    isItemLoading,
    isLoadingStatus,
    isLoadingCategory,
    isLoadingHarvestUnits,
  ];
  const errorStates = [
    isItemError,
    isErrorStatus,
    isErrorCategory,
    isErrorHarvestUnits,
  ];

  const isLoading = loadingStates.some((loading) => loading);
  const isError = errorStates.some((error) => error);

  if (inventoryItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Alert variant="destructive" className="w-full max-w-md text-center">
          <div className="flex flex-col items-center">
            <TriangleAlertIcon className="h-6 w-6 text-red-500 mb-2" />
            <AlertTitle>No Inventory Data</AlertTitle>
            <AlertDescription>
              You currently have no inventory items. Add a new item to get
              started!
            </AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }
  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  if (isError)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Error loading inventory data.
      </div>
    );

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold tracking-tight mb-6">Inventory</h1>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Search className="mt-1" />
            <Input
              type="search"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <AddInventoryItem
              inventoryCategory={inventoryCategory}
              inventoryStatus={inventoryStatus}
              harvestUnits={harvestUnits}
            />
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer "
                      >
                        <div className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() &&
                            !header.column.columnDef.enableSorting && (
                              <span className="ml-2">
                                {header.column.getIsSorted() === "desc" ? (
                                  <FaSortDown />
                                ) : header.column.getIsSorted() === "asc" ? (
                                  <FaSortUp />
                                ) : (
                                  <FaSort />
                                )}
                              </span>
                            )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="even:bg-gray-800">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination className="mt-5">
            <PaginationContent className="space-x-5">
              <PaginationItem>
                <Button
                  className="flex w-24"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: Math.max(0, prev.pageIndex - 1),
                    }))
                  }
                  disabled={pagination.pageIndex === 0}
                >
                  Previous
                </Button>
              </PaginationItem>

              <PaginationItem>
                <Button
                  className="flex w-24"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: prev.pageIndex + 1,
                    }))
                  }
                  disabled={
                    pagination.pageIndex >=
                    Math.ceil(filteredItems.length / pagination.pageSize) - 1
                  }
                >
                  Next
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </main>
      </div>
    </div>
  );
}
