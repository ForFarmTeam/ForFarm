"use client";

import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { IMarketData, ITrend } from "@/lib/marketData";

interface MarketPriceTableProps {
  marketData: IMarketData[];
  isLoading: boolean;
  onSelectCrop: (crop: string) => void;
}

const getTrendColor = (trend: ITrend) => (trend.direction === "up" ? "text-green-600" : "text-red-600");

const getTrendIcon = (trend: ITrend) =>
  trend.direction === "up" ? (
    <ArrowUpRight className="h-4 w-4 text-green-600" />
  ) : (
    <ArrowDownRight className="h-4 w-4 text-red-600" />
  );

export default function MarketPriceTable({ marketData, isLoading, onSelectCrop }: MarketPriceTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Price Table</CardTitle>
          <CardDescription>Comprehensive price data across all markets and crops</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Price Table</CardTitle>
        <CardDescription>Comprehensive price data across all markets and crops</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Crop</TableHead>
                {marketData[0]?.marketPrices.map((market) => (
                  <TableHead key={market.market}>{market.market}</TableHead>
                ))}
                <TableHead>Average</TableHead>
                <TableHead>Recommended</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {marketData.map((crop) => (
                <TableRow
                  key={crop.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectCrop(crop.name)}>
                  <TableCell className="font-medium">{crop.name}</TableCell>
                  {crop.marketPrices.map((market) => (
                    <TableCell key={market.market}>
                      <div className="flex items-center gap-1">
                        <span>${market.price.toFixed(2)}</span>
                        <span className={getTrendColor(market.trend)}>{getTrendIcon(market.trend)}</span>
                      </div>
                    </TableCell>
                  ))}
                  <TableCell>${crop.averagePrice.toFixed(2)}</TableCell>
                  <TableCell className="font-medium text-amber-600">${crop.recommendedPrice.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
