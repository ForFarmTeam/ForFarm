"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Leaf,
  BarChart3,
  LineChartIcon,
  PieChart
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";

// Define types for market data

interface ITrend {
  direction: "up" | "down";
  value: string;
}

interface IMarketPrice {
  market: string;
  price: number;
  demand: number;
  trend: ITrend;
}

export interface IMarketData {
  id: string;
  name: string;
  marketPrices: IMarketPrice[];
  averagePrice: number;
  recommendedPrice: number;
  demandScore: number;
  opportunity: boolean;
}

export interface IHistoricalData {
  date: string;
  price: number;
  volume: number;
}

export interface IMarketComparison {
  name: string;
  price: number;
  demand: number;
}

// Types for tooltip props from recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

// Types for MarketOpportunity props
interface MarketOpportunityProps {
  crop: string;
  data: IMarketComparison[];
}

// Mock data for market prices
const generateMarketData = (): IMarketData[] => {
  const crops = [
    "Corn",
    "Wheat",
    "Soybeans",
    "Rice",
    "Potatoes",
    "Tomatoes",
    "Apples",
    "Oranges"
  ];
  const markets = [
    "National Market",
    "Regional Hub",
    "Local Market",
    "Export Market",
    "Wholesale Market"
  ];

  const getRandomPrice = (base: number) =>
    Number((base + Math.random() * 2).toFixed(2));
  const getRandomDemand = () => Math.floor(Math.random() * 100);
  const getRandomTrend = (): ITrend =>
    Math.random() > 0.5
      ? { direction: "up", value: (Math.random() * 5).toFixed(1) }
      : { direction: "down", value: (Math.random() * 5).toFixed(1) };

  return crops.map((crop) => {
    const basePrice =
      crop === "Corn"
        ? 4
        : crop === "Wheat"
        ? 6
        : crop === "Soybeans"
        ? 10
        : crop === "Rice"
        ? 12
        : crop === "Potatoes"
        ? 3
        : crop === "Tomatoes"
        ? 2
        : crop === "Apples"
        ? 1.5
        : 8;

    return {
      id: crypto.randomUUID(),
      name: crop,
      marketPrices: markets.map((market) => ({
        market,
        price: getRandomPrice(basePrice),
        demand: getRandomDemand(),
        trend: getRandomTrend()
      })),
      averagePrice: getRandomPrice(basePrice - 0.5),
      recommendedPrice: getRandomPrice(basePrice + 0.2),
      demandScore: getRandomDemand(),
      opportunity: Math.random() > 0.7
    };
  });
};

// Generate historical price data for a specific crop
const generateHistoricalData = (
  crop: string,
  days = 30
): IHistoricalData[] => {
  const basePrice =
    crop === "Corn"
      ? 4
      : crop === "Wheat"
      ? 6
      : crop === "Soybeans"
      ? 10
      : crop === "Rice"
      ? 12
      : crop === "Potatoes"
      ? 3
      : crop === "Tomatoes"
      ? 2
      : crop === "Apples"
      ? 1.5
      : 8;

  const data: IHistoricalData[] = [];
  let currentPrice = basePrice;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.5) * 0.4;
    currentPrice = Math.max(0.5, currentPrice + change);

    data.push({
      date: date.toISOString().split("T")[0],
      price: Number(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000) + 200
    });
  }

  return data;
};

// Generate market comparison data
const generateMarketComparisonData = (
  crop: string
): IMarketComparison[] => {
  const markets = [
    "National Market",
    "Regional Hub",
    "Local Market",
    "Export Market",
    "Wholesale Market"
  ];
  const basePrice =
    crop === "Corn"
      ? 4
      : crop === "Wheat"
      ? 6
      : crop === "Soybeans"
      ? 10
      : crop === "Rice"
      ? 12
      : crop === "Potatoes"
      ? 3
      : crop === "Tomatoes"
      ? 2
      : crop === "Apples"
      ? 1.5
      : 8;

  return markets.map((market) => ({
    name: market,
    price: Number((basePrice + (Math.random() - 0.5) * 2).toFixed(2)),
    demand: Math.floor(Math.random() * 100)
  }));
};

// Custom tooltip for the price chart
const CustomTooltip = ({
  active,
  payload,
  label
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <Card className="bg-white dark:bg-gray-800 p-2 shadow-md border-none">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary">Price: ${payload[0].value}</p>
        {payload[1] && (
          <p className="text-sm text-gray-500">
            Volume: {payload[1].value} units
          </p>
        )}
      </Card>
    );
  }
  return null;
};

// Market opportunity component
const MarketOpportunity = ({ crop, data }: MarketOpportunityProps) => {
  const highestPrice = Math.max(...data.map((item) => item.price));
  const bestMarket = data.find((item) => item.price === highestPrice);
  const highestDemand = Math.max(...data.map((item) => item.demand));
  const highDemandMarket = data.find(
    (item) => item.demand === highestDemand
  );

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
          Sales Opportunity for {crop}
        </CardTitle>
        <CardDescription>
          Based on current market conditions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">
              Best Price Opportunity
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-green-600">
                  ${bestMarket?.price}
                </p>
                <p className="text-sm text-muted-foreground">
                  {bestMarket?.name}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                {Math.round((bestMarket!.price / (highestPrice - 1)) * 100)}%
                above average
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-1">
              Highest Demand
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">
                  {highDemandMarket?.name}
                </p>
                <div className="flex items-center">
                  <Progress
                    value={highDemandMarket?.demand}
                    className="h-2 w-24 mr-2"
                  />
                  <span className="text-sm">
                    {highDemandMarket?.demand}% demand
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <MapPin className="h-4 w-4" /> View Market
              </Button>
            </div>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">
              Recommendation
            </AlertTitle>
            <AlertDescription className="text-amber-700">
              Consider selling your {crop} at {bestMarket?.name} within
              the next 7 days to maximize profit.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const initialCrop = searchParams.get("crop") || "Corn";

  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop);
  const [timeRange, setTimeRange] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [marketData, setMarketData] = useState<IMarketData[]>([]);
  const [historicalData, setHistoricalData] = useState<IHistoricalData[]>([]);
  const [marketComparison, setMarketComparison] =
    useState<IMarketComparison[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setMarketData(generateMarketData());
      setHistoricalData(
        generateHistoricalData(selectedCrop, Number.parseInt(timeRange))
      );
      setMarketComparison(generateMarketComparisonData(selectedCrop));
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [selectedCrop, timeRange]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setMarketData(generateMarketData());
      setHistoricalData(
        generateHistoricalData(selectedCrop, Number.parseInt(timeRange))
      );
      setMarketComparison(generateMarketComparisonData(selectedCrop));
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  // Removed unused variable "selectedCropData"

  const getTrendColor = (trend: ITrend) => {
    return trend.direction === "up" ? "text-green-600" : "text-red-600";
  };

  const getTrendIcon = (trend: ITrend) => {
    return trend.direction === "up" ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Marketplace Information
          </h1>
          <p className="text-muted-foreground mt-1">
            Make informed decisions with real-time market data and price
            analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            {isLoading ? "Updating..." : "Refresh Data"}
          </Button>
          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Price Analytics</CardTitle>
                <CardDescription>
                  Track price trends and market movements
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
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

                <Select value={timeRange} onValueChange={setTimeRange}>
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
                  <p className="mt-2 text-sm text-muted-foreground">
                    Loading market data...
                  </p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="price">
                <TabsList className="mb-4">
                  <TabsTrigger value="price" className="gap-1">
                    <LineChartIcon className="h-4 w-4" /> Price Trend
                  </TabsTrigger>
                  <TabsTrigger value="comparison" className="gap-1">
                    <BarChart3 className="h-4 w-4" /> Market Comparison
                  </TabsTrigger>
                  <TabsTrigger value="demand" className="gap-1">
                    <PieChart className="h-4 w-4" /> Demand Analysis
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="price" className="mt-0">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={historicalData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${
                              date.getDate()
                            }`;
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
                            <p className="text-sm font-medium text-muted-foreground">
                              Current Price
                            </p>
                            <p className="text-2xl font-bold text-green-700">
                              $
                              {historicalData[
                                historicalData.length - 1
                              ]?.price.toFixed(2)}
                            </p>
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
                            <p className="text-sm font-medium text-muted-foreground">
                              30-Day Average
                            </p>
                            <p className="text-2xl font-bold">
                              $
                              {(
                                historicalData.reduce(
                                  (sum, item) => sum + item.price,
                                  0
                                ) / historicalData.length
                              ).toFixed(2)}
                            </p>
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
                            <p className="text-sm font-medium text-muted-foreground">
                              Recommended Price
                            </p>
                            <p className="text-2xl font-bold text-amber-600">
                              $
                              {(
                                historicalData[historicalData.length - 1]
                                  ?.price * 1.05
                              ).toFixed(2)}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200"
                          >
                            +5% margin
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="comparison" className="mt-0">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={marketComparison}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                        />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="price"
                          name="Price per unit"
                          fill="#16a34a"
                          radius={[4, 4, 0, 0]}
                        >
                          {marketComparison.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.price ===
                                Math.max(
                                  ...marketComparison.map(
                                    (item) => item.price
                                  )
                                )
                                  ? "#15803d"
                                  : "#16a34a"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4">
                    <Table>
                      <TableCaption>
                        Market comparison for {selectedCrop} as of{" "}
                        {new Date().toLocaleDateString()}
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Market</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Demand</TableHead>
                          <TableHead>Price Difference</TableHead>
                          <TableHead className="text-right">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {marketComparison.map((market) => {
                          const avgPrice =
                            marketComparison.reduce(
                              (sum, m) => sum + m.price,
                              0
                            ) / marketComparison.length;
                          const priceDiff = (
                            ((market.price - avgPrice) / avgPrice) *
                            100
                          ).toFixed(1);
                          const isPriceHigh = Number.parseFloat(priceDiff) > 0;

                          return (
                            <TableRow
                              key={market.name}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() =>
                                setSelectedCrop(market.name)
                              }
                            >
                              <TableCell className="font-medium">
                                {market.name}
                              </TableCell>
                              <TableCell>
                                ${market.price.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={market.demand}
                                    className="h-2 w-16"
                                  />
                                  <span>{market.demand}%</span>
                                </div>
                              </TableCell>
                              <TableCell
                                className={
                                  isPriceHigh
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                <div className="flex items-center gap-1">
                                  {isPriceHigh ? (
                                    <ArrowUpRight className="h-4 w-4" />
                                  ) : (
                                    <ArrowDownRight className="h-4 w-4" />
                                  )}
                                  {priceDiff}%
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1"
                                >
                                  Details <ChevronRight className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="demand" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                          Demand Forecast
                        </CardTitle>
                        <CardDescription>
                          Projected demand for {selectedCrop} over the next 30 days
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {marketComparison.map((market) => (
                            <div key={market.name} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{market.name}</span>
                                <span className="font-medium">
                                  {market.demand}%
                                </span>
                              </div>
                              <Progress value={market.demand} className="h-2" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <MarketOpportunity crop={selectedCrop} data={marketComparison} />
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Market Summary</CardTitle>
              <CardDescription>
                Today&apos;s market overview
              </CardDescription>
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
                      <div
                        key={crop.id}
                        className="flex items-center justify-between"
                      >
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => setSelectedCrop(crop.name)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Opportunities</CardTitle>
              <CardDescription>
                Best selling opportunities today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : (
                <div className="space-y-3">
                  {marketData
                    .filter((crop) => crop.opportunity)
                    .slice(0, 3)
                    .map((crop) => {
                      const bestMarket = crop.marketPrices.reduce(
                        (best, current) =>
                          current.price > best.price ? current : best,
                        crop.marketPrices[0]
                      );
                      return (
                        <div
                          key={crop.id}
                          className="border rounded-lg p-3 bg-green-50/50 dark:bg-green-950/10"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{crop.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {bestMarket.market} - $
                                {bestMarket.price.toFixed(2)}
                              </p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              High Demand
                            </Badge>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">
                                Recommended
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => setSelectedCrop(crop.name)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Price Table</CardTitle>
          <CardDescription>
            Comprehensive price data across all markets and crops
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crop</TableHead>
                    {marketData[0]?.marketPrices.map((market) => (
                      <TableHead key={market.market}>
                        {market.market}
                      </TableHead>
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
                      onClick={() => setSelectedCrop(crop.name)}
                    >
                      <TableCell className="font-medium">
                        {crop.name}
                      </TableCell>
                      {crop.marketPrices.map((market) => (
                        <TableCell key={market.market}>
                          <div className="flex items-center gap-1">
                            <span>${market.price.toFixed(2)}</span>
                            <span className={getTrendColor(market.trend)}>
                              {getTrendIcon(market.trend)}
                            </span>
                          </div>
                        </TableCell>
                      ))}
                      <TableCell>
                        ${crop.averagePrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium text-amber-600">
                        ${crop.recommendedPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}