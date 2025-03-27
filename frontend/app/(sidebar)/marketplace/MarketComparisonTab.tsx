"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { IMarketComparison } from "@/lib/marketData";

interface MarketComparisonTabProps {
  marketComparison: IMarketComparison[];
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
}

export default function MarketComparisonTab({
  marketComparison,
  selectedCrop,
  onSelectCrop,
}: MarketComparisonTabProps) {
  return (
    <>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={marketComparison} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
            <Tooltip />
            <Legend />
            <Bar dataKey="price" name="Price per unit" fill="#16a34a" radius={[4, 4, 0, 0]}>
              {marketComparison.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.price === Math.max(...marketComparison.map((item) => item.price)) ? "#15803d" : "#16a34a"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <Table>
          <TableCaption>
            Market comparison for {selectedCrop} as of {new Date().toLocaleDateString()}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Market</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Demand</TableHead>
              <TableHead>Price Difference</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketComparison.map((market) => {
              const avgPrice = marketComparison.reduce((sum, m) => sum + m.price, 0) / marketComparison.length;
              const priceDiff = (((market.price - avgPrice) / avgPrice) * 100).toFixed(1);
              const isPriceHigh = Number.parseFloat(priceDiff) > 0;

              return (
                <TableRow
                  key={market.name}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectCrop(market.name)}>
                  <TableCell className="font-medium">{market.name}</TableCell>
                  <TableCell>${market.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={market.demand} className="h-2 w-16" />
                      <span>{market.demand}%</span>
                    </div>
                  </TableCell>
                  <TableCell className={isPriceHigh ? "text-green-600" : "text-red-600"}>
                    <div className="flex items-center gap-1">
                      {isPriceHigh ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {priceDiff}%
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      Details <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
