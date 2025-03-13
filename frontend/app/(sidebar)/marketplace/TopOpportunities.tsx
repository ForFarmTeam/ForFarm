"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { IMarketData } from "@/lib/marketData";

interface TopOpportunitiesProps {
  marketData: IMarketData[];
  isLoading: boolean;
  onSelectCrop: (crop: string) => void;
}

export default function TopOpportunities({ marketData, isLoading, onSelectCrop }: TopOpportunitiesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top Opportunities</CardTitle>
          <CardDescription>Best selling opportunities today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top Opportunities</CardTitle>
        <CardDescription>Best selling opportunities today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {marketData
            .filter((crop) => crop.opportunity)
            .slice(0, 3)
            .map((crop) => {
              const bestMarket = crop.marketPrices.reduce(
                (best, current) => (current.price > best.price ? current : best),
                crop.marketPrices[0]
              );
              return (
                <div key={crop.id} className="border rounded-lg p-3 bg-green-50/50 dark:bg-green-950/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{crop.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bestMarket.market} - ${bestMarket.price.toFixed(2)}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">High Demand</Badge>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Recommended</span>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onSelectCrop(crop.name)}>
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
