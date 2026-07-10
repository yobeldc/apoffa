"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

interface JobLogsViewProps {
  logs: LogEntry[];
}

export function JobLogsView({ logs }: JobLogsViewProps) {
  const getLevelBadge = (level: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      info: "default",
      warn: "secondary",
      error: "destructive",
    };
    return <Badge variant={variants[level] || "outline"}>{level}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No logs available.</p>
        ) : (
          <div className="max-h-[400px] overflow-auto space-y-2">
            {logs.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-md bg-muted p-2 text-sm"
              >
                <span className="text-xs text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                {getLevelBadge(log.level)}
                <span className="flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
