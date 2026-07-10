import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataQualityBadge } from "./data-quality-badge";
import { formatDate } from "@/lib/utils";

interface CaseResultCardProps {
  id: string;
  title: string;
  court?: string | null;
  year?: number | null;
  date?: string | null;
  summary?: string | null;
  caseType?: string | null;
  dataQuality?: string | null;
  onClick?: () => void;
}

export function CaseResultCard({
  title,
  court,
  year,
  date,
  summary,
  caseType,
  dataQuality,
  onClick,
}: CaseResultCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex flex-wrap gap-1">
          {court && <Badge variant="outline">{court}</Badge>}
          {year && <Badge variant="secondary">{year}</Badge>}
          {caseType && <Badge variant="outline">{caseType}</Badge>}
          {dataQuality && <DataQualityBadge quality={dataQuality} />}
        </div>
      </CardHeader>
      <CardContent>
        {date && (
          <p className="mb-2 text-xs text-muted-foreground">
            {formatDate(date)}
          </p>
        )}
        {summary && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
