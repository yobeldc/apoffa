import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Network,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  FileText,
  Trash2,
  RefreshCw,
  Search,
} from 'lucide-react';
import type { EntityNode, EntityEdge } from '@/lib/apoffa-graph/ui-types';

interface ApoffaGraphCasePanelProps {
  caseId: string;
  onNodeClick?: (node: EntityNode) => void;
  onRefresh?: () => void;
}

export function ApoffaGraphCasePanel({ caseId, onNodeClick, onRefresh }: ApoffaGraphCasePanelProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Fetch graph data for the case
  const { data: graphData, isLoading, error } = useQuery({
    queryKey: ['apoffa-graph', caseId],
    queryFn: async () => {
      const res = await fetch(`/api/cases/${caseId}/graph`);
      if (!res.ok) throw new Error('Failed to load graph data');
      return res.json() as Promise<{ nodes: EntityNode[]; edges: EntityEdge[] }>;
    },
    enabled: !!caseId,
  });

  // Extract entities mutation
  const extractMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/cases/${caseId}/extract`, { method: 'POST' });
      if (!res.ok) throw new Error('Extraction failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoffa-graph', caseId] });
      toast.success('Entity extraction complete');
      onRefresh?.();
    },
    onError: (err) => {
      toast.error(`Extraction failed: ${err.message}`);
    },
  });

  // Delete entity mutation
  const deleteMutation = useMutation({
    mutationFn: async (entityId: string) => {
      const res = await fetch(`/api/cases/${caseId}/entities/${entityId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete entity');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apoffa-graph', caseId] });
      toast.success('Entity removed');
    },
  });

  // Filter nodes
  const filteredNodes = React.useMemo(() => {
    if (!graphData?.nodes) return [];
    return graphData.nodes.filter((node) => {
      const matchesSearch = !searchQuery ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !selectedType || node.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [graphData, searchQuery, selectedType]);

  // Get unique entity types
  const entityTypes = React.useMemo(() => {
    if (!graphData?.nodes) return [];
    const types = new Set(graphData.nodes.map((n) => n.type));
    return Array.from(types);
  }, [graphData]);

  // Get entity count by type
  const typeCounts = React.useMemo(() => {
    if (!graphData?.nodes) return {};
    return graphData.nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [graphData]);

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'PERSON': return <User className="h-4 w-4" />;
      case 'EMAIL': return <Mail className="h-4 w-4" />;
      case 'PHONE': return <Phone className="h-4 w-4" />;
      case 'URL': return <Globe className="h-4 w-4" />;
      case 'IP_ADDRESS': return <MapPin className="h-4 w-4" />;
      case 'MAC_ADDRESS': return <MapPin className="h-4 w-4" />;
      case 'ORGANIZATION': return <FileText className="h-4 w-4" />;
      case 'LOCATION': return <MapPin className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'PERSON': return 'default';
      case 'EMAIL': return 'secondary';
      case 'PHONE': return 'secondary';
      case 'URL': return 'outline';
      case 'IP_ADDRESS': return 'destructive';
      case 'MAC_ADDRESS': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Entity Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Failed to load graph data</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['apoffa-graph', caseId] })}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Entity Graph
            {graphData && (
              <Badge variant="secondary" className="text-xs">
                {graphData.nodes.length} entities
              </Badge>
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => extractMutation.mutate()}
            disabled={extractMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${extractMutation.isPending ? 'animate-spin' : ''}`} />
            {extractMutation.isPending ? 'Extracting...' : 'Extract'}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type filters */}
        {entityTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={selectedType === null ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7"
              onClick={() => setSelectedType(null)}
            >
              All ({graphData?.nodes.length || 0})
            </Button>
            {entityTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setSelectedType(type === selectedType ? null : type)}
              >
                {type} ({typeCounts[type] || 0})
              </Button>
            ))}
          </div>
        )}

        <Separator />

        {/* Entity list */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-2 pr-3">
            {filteredNodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {graphData?.nodes.length === 0 ? (
                  <div>
                    <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No entities found</p>
                    <p className="text-xs mt-1">Click "Extract" to analyze case content</p>
                  </div>
                ) : (
                  <p>No entities match your search</p>
                )}
              </div>
            ) : (
              filteredNodes.map((node) => (
                <div
                  key={node.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onNodeClick?.(node)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-muted-foreground shrink-0">
                      {getEntityIcon(node.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{node.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={getBadgeVariant(node.type)} className="text-[10px] px-1.5 py-0">
                          {node.type}
                        </Badge>
                        {node.relevance && (
                          <span className="text-[10px] text-muted-foreground">
                            {(node.relevance * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(node.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Stats footer */}
        {graphData && (
          <div className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
            <span>{graphData.edges.length} relationships</span>
            <span>{filteredNodes.length} shown</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
