"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, ArrowDownRight, TrendingUp, MapPin, AlertCircle } from "lucide-react";
import { IMarketComparison } from "@/lib/marketData";

interface MarketOpportunityProps {
  crop: string;
  data: IMarketComparison[];
}

export default function MarketOpportunity({ crop, data }: MarketOpportunityProps) {
  const highestPrice = Math.max(...data.map((item) => item.price));
  const bestMarket = data.find((item) => item.price === highestPrice);
  const highestDemand = Math.max(...data.map((item) => item.demand));
  const highDemandMarket = data.find((item) => item.demand === highestDemand);

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
          Sales Opportunity for {crop}
        </CardTitle>
        <CardDescription>Based on current market conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Best Price Opportunity</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-green-600">${bestMarket?.price}</p>
                <p className="text-sm text-muted-foreground">{bestMarket?.name}</p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                {Math.round((bestMarket!.price / (highestPrice - 1)) * 100)}% above average
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-1">Highest Demand</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{highDemandMarket?.name}</p>
                <div className="flex items-center">
                  <Progress value={highDemandMarket?.demand} className="h-2 w-24 mr-2" />
                  <span className="text-sm">{highDemandMarket?.demand}% demand</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <MapPin className="h-4 w-4" /> View Market
              </Button>
            </div>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Recommendation</AlertTitle>
            <AlertDescription className="text-amber-700">
              Consider selling your {crop} at {bestMarket?.name} within the next 7 days to maximize profit.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
