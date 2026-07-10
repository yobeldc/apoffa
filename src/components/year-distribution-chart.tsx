"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface YearData {
  year: number | null;
  _count: { id: number };
}

interface YearDistributionChartProps {
  data: YearData[];
}

export function YearDistributionChart({ data }: YearDistributionChartProps) {
  const sorted = [...data]
    .filter((d) => d.year !== null)
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .slice(0, 10);

  const maxCount = Math.max(...sorted.map((d) => d._count.id), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cases by Year</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sorted.map((item) => (
            <div key={item.year} className="flex items-center gap-2">
              <span className="w-12 text-sm text-muted-foreground">
                {item.year}
              </span>
              <div className="flex-1">
                <div
                  className="h-4 rounded bg-primary transition-all"
                  style={{
                    width: `${(item._count.id / maxCount) * 100}%`,
                  }}
                />
              </div>
              <span className="w-8 text-right text-sm">{item._count.id}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
