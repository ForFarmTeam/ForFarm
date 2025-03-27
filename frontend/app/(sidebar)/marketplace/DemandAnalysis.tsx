"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import MarketOpportunity from "./MarketOpportunity";
import { IMarketComparison } from "@/lib/marketData";

interface DemandAnalysisProps {
  selectedCrop: string;
  marketComparison: IMarketComparison[];
}

export default function DemandAnalysis({ selectedCrop, marketComparison }: DemandAnalysisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Demand Forecast</CardTitle>
          <CardDescription>Projected demand for {selectedCrop} over the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketComparison.map((market) => (
              <div key={market.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{market.name}</span>
                  <span className="font-medium">{market.demand}%</span>
                </div>
                <Progress value={market.demand} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <MarketOpportunity crop={selectedCrop} data={marketComparison} />
    </div>
  );
}
