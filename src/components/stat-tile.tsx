import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatTileProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatTile({ title, value, description, trend }: StatTileProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p
            className={`text-xs ${
              trend.value >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
