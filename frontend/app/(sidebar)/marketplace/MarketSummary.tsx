// components/MarketSummary.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMarketData } from "@/lib/marketData";

interface MarketSummaryProps {
  marketData: IMarketData[];
  isLoading: boolean;
  onSelectCrop: (crop: string) => void;
}

export default function MarketSummary({ marketData, isLoading, onSelectCrop }: MarketSummaryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Market Summary</CardTitle>
        <CardDescription>Today's market overview</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : (
          <ScrollArea className="h-[220px] pr-4">
            <div className="space-y-4">
              {marketData.slice(0, 5).map((crop) => (
                <div key={crop.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{crop.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>${crop.averagePrice.toFixed(2)}</span>
                      {crop.marketPrices[0].trend.direction === "up" ? (
                        <span className="flex items-center text-green-600 ml-1">
                          <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          {crop.marketPrices[0].trend.value}%
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 ml-1">
                          <ArrowDownRight className="h-3 w-3 mr-0.5" />
                          {crop.marketPrices[0].trend.value}%
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8" onClick={() => onSelectCrop(crop.name)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
