"use client";

import {
  useState,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
  useMemo,
} from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Search } from "lucide-react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

import { Badge } from "@/components/ui/badge";
import { fetchInventoryItems } from "@/api/inventory";
import { AddInventoryItem } from "./add-inventory-item";
import { EditInventoryItem } from "./edit-inventory-item";
import { DeleteInventoryItem } from "./delete-inventory-item";

export default function InventoryPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: inventoryItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["inventoryItems"],
    queryFn: fetchInventoryItems,
    staleTime: 60 * 1000,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = () => {
    // update search state when user clicks or presses enter
    setSearchTerm(searchTerm);
  };
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventoryItems, searchTerm]);

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "lastUpdated", header: "Last Updated" },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info: {
        getValue: () =>
          | string
          | number
          | bigint
          | boolean
          | ReactElement<unknown, string | JSXElementConstructor<any>>
          | Iterable<ReactNode>
          | ReactPortal
          | Promise<
              | string
              | number
              | bigint
              | boolean
              | ReactPortal
              | ReactElement<unknown, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | null
              | undefined
            >
          | null
          | undefined;
      }) => <Badge>{info.getValue()}</Badge>,
    },
    {
      accessorKey: "edit",
      header: "Edit",
      cell: () => <EditInventoryItem />,
      enableSorting: false,
    },
    {
      accessorKey: "delete",
      header: "Delete",
      cell: () => <DeleteInventoryItem />,
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
            <AddInventoryItem />
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
                  <TableRow key={row.id}>
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
