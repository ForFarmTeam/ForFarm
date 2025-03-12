// components/PriceAnalyticsCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PriceAnalytics from "./PriceAnalytics";
import MarketComparisonTab from "./MarketComparisonTab";
import DemandAnalysis from "./DemandAnalysis";

interface PriceAnalyticsCardProps {
  isLoading: boolean;
  selectedCrop: string;
  timeRange: string;
  lastUpdated: Date;
  onSelectCrop: (crop: string) => void;
  onTimeRangeChange: (value: string) => void;
  onRefresh: () => void;
  historicalData: any;
  marketComparison: any;
}

export default function PriceAnalyticsCard({
  isLoading,
  selectedCrop,
  timeRange,
  lastUpdated,
  onSelectCrop,
  onTimeRangeChange,
  onRefresh,
  historicalData,
  marketComparison,
}: PriceAnalyticsCardProps) {
  return (
    <Card className="md:col-span-3">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Price Analytics</CardTitle>
            <CardDescription>Track price trends and market movements</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCrop} onValueChange={onSelectCrop}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Corn">Corn</SelectItem>
                <SelectItem value="Wheat">Wheat</SelectItem>
                <SelectItem value="Soybeans">Soybeans</SelectItem>
                <SelectItem value="Rice">Rice</SelectItem>
                <SelectItem value="Potatoes">Potatoes</SelectItem>
                <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                <SelectItem value="Apples">Apples</SelectItem>
                <SelectItem value="Oranges">Oranges</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={onTimeRangeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary/70" />
              <p className="mt-2 text-sm text-muted-foreground">Loading market data...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="price">
            <TabsList className="mb-4">
              <TabsTrigger value="price" className="gap-1">
                Price Trend
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-1">
                Market Comparison
              </TabsTrigger>
              <TabsTrigger value="demand" className="gap-1">
                Demand Analysis
              </TabsTrigger>
            </TabsList>
            <TabsContent value="price" className="mt-0">
              <PriceAnalytics historicalData={historicalData} isLoading={isLoading} selectedCrop={selectedCrop} />
            </TabsContent>
            <TabsContent value="comparison" className="mt-0">
              <MarketComparisonTab
                marketComparison={marketComparison}
                selectedCrop={selectedCrop}
                onSelectCrop={onSelectCrop}
              />
            </TabsContent>
            <TabsContent value="demand" className="mt-0">
              <DemandAnalysis selectedCrop={selectedCrop} marketComparison={marketComparison} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
