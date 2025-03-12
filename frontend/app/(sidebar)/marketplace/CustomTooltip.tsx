"use client";

import { Card } from "@/components/ui/card";

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

export default function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <Card className="bg-white dark:bg-gray-800 p-2 shadow-md border-none">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-primary">Price: ${payload[0].value}</p>
        {payload[1] && <p className="text-sm text-gray-500">Volume: {payload[1].value} units</p>}
      </Card>
    );
  }
  return null;
}
