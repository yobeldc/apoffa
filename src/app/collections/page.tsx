"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CaseResultCard } from "@/components/case-result-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";
import { FolderOpen, Plus, Search } from "lucide-react";

// Mock collections for demo
const MOCK_COLLECTIONS = [
  {
    id: "1",
    name: "Contract Law",
    description: "Cases related to contract disputes and interpretations",
    caseIds: ["1", "2"],
  },
  {
    id: "2",
    name: "Constitutional Rights",
    description: "Cases involving constitutional protections",
    caseIds: ["3"],
  },
];

export default function CollectionsPage() {
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showNewCollection, setShowNewCollection] = useState(false);
  const router = useRouter();

  const activeColl = MOCK_COLLECTIONS.find((c) => c.id === activeCollection);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Collections</h1>
        <Button onClick={() => setShowNewCollection(!showNewCollection)}>
          <Plus className="mr-2 h-4 w-4" />
          New Collection
        </Button>
      </div>

      {showNewCollection && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Collection name..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
              <Button>Create</Button>
              <Button variant="ghost" onClick={() => setShowNewCollection(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Collections</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {MOCK_COLLECTIONS.length === 0 ? (
            <EmptyState
              title="No collections yet"
              description="Create your first collection to organize cases."
              icon={<FolderOpen className="h-8 w-8" />}
              action={{
                label: "Create Collection",
                onClick: () => setShowNewCollection(true),
              }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {MOCK_COLLECTIONS.map((collection) => (
                <Card
                  key={collection.id}
                  className={`cursor-pointer transition-colors ${
                    activeCollection === collection.id
                      ? "border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() =>
                    setActiveCollection(
                      activeCollection === collection.id ? null : collection.id
                    )
                  }
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                    <Badge variant="secondary" className="mt-2">
                      {collection.caseIds.length} cases
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <EmptyState
            title="No recent collections"
            description="Collections you've viewed recently will appear here."
          />
        </TabsContent>
      </Tabs>

      {activeColl && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{activeColl.name} - Cases</h2>
          <p className="text-muted-foreground">{activeColl.description}</p>
          {/* Would fetch and display actual cases here */}
          <EmptyState
            title="Cases in this collection"
            description="Case listing would appear here with actual data."
          />
        </div>
      )}
    </div>
  );
}
