"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Leaf, Calendar } from "lucide-react";
import CustomTooltip from "./CustomTooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IHistoricalData } from "@/lib/marketData";

interface PriceAnalyticsProps {
  historicalData: IHistoricalData[];
  isLoading: boolean;
  selectedCrop: string;
}

export default function PriceAnalytics({ historicalData, isLoading, selectedCrop }: PriceAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary/70" />
          <p className="mt-2 text-sm text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  const currentPrice = historicalData[historicalData.length - 1]?.price ?? 0;
  const averagePrice = historicalData.reduce((sum, item) => sum + item.price, 0) / historicalData.length;
  const recommendedPrice = currentPrice * 1.05;

  return (
    <>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
            />
            <YAxis
              yAxisId={1}
              orientation="right"
              tick={{ fontSize: 12 }}
              hide={true}
              domain={["dataMin", "dataMax"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 6 }}
              name="Price per unit"
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#9ca3af"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              name="Trading volume"
              yAxisId={1}
              hide={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold text-green-700">${currentPrice.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">30-Day Average</p>
                <p className="text-2xl font-bold">${averagePrice.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recommended Price</p>
                <p className="text-2xl font-bold text-amber-600">${recommendedPrice.toFixed(2)}</p>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                +5% margin
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
