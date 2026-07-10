import { Badge } from "@/components/ui/badge";

interface DataQualityBadgeProps {
  quality: string;
}

export function DataQualityBadge({ quality }: DataQualityBadgeProps) {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    verified: "default",
    pending: "secondary",
    needs_review: "destructive",
  };

  const labelMap: Record<string, string> = {
    verified: "Verified",
    pending: "Pending",
    needs_review: "Needs Review",
  };

  const variant = variantMap[quality] || "outline";
  const label = labelMap[quality] || quality;

  return <Badge variant={variant}>{label}</Badge>;
}
