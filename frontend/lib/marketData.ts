export interface ITrend {
  direction: "up" | "down";
  value: string;
}

export interface IMarketPrice {
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

export const generateMarketData = (): IMarketData[] => {
  const crops = ["Corn", "Wheat", "Soybeans", "Rice", "Potatoes", "Tomatoes", "Apples", "Oranges"];
  const markets = ["National Market", "Regional Hub", "Local Market", "Export Market", "Wholesale Market"];

  const getRandomPrice = (base: number) => Number((base + Math.random() * 2).toFixed(2));
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
        trend: getRandomTrend(),
      })),
      averagePrice: getRandomPrice(basePrice - 0.5),
      recommendedPrice: getRandomPrice(basePrice + 0.2),
      demandScore: getRandomDemand(),
      opportunity: Math.random() > 0.7,
    };
  });
};

export const generateHistoricalData = (crop: string, days = 30): IHistoricalData[] => {
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
      volume: Math.floor(Math.random() * 1000) + 200,
    });
  }

  return data;
};

export const generateMarketComparisonData = (crop: string): IMarketComparison[] => {
  const markets = ["National Market", "Regional Hub", "Local Market", "Export Market", "Wholesale Market"];
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
    demand: Math.floor(Math.random() * 100),
  }));
};
