import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FolderOpen, FileText, Activity, Shield } from 'lucide-react';

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== 'admin') redirect('/');

  const [totalUsers, totalCases, totalDocuments, recentActivity, usersByRole] = await Promise.all([
    prisma.user.count(),
    prisma.case.count(),
    prisma.document.count(),
    prisma.caseHistory.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { case: { select: { title: true } }, creator: { select: { name: true } } } }),
    prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
  ]);

  const stats = [
    { title: 'Total Users', value: totalUsers, icon: Users },
    { title: 'Total Cases', value: totalCases, icon: FolderOpen },
    { title: 'Documents', value: totalDocuments, icon: FileText },
    { title: 'Activity', value: recentActivity.length, icon: Activity },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground mt-1">Manage your APOffa instance</p></div>
        <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map(s => (
          <Card key={s.title}><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{s.title}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{s.value}</div></CardContent></Card>
        ))}
      </div>

      <Card><CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader><CardContent>
        <div className="space-y-4">
          {recentActivity.map(a => (
            <div key={a.id} className="flex justify-between border-b pb-2 last:border-0">
              <div><p className="font-medium">{a.event}</p><p className="text-sm text-muted-foreground">{a.case?.title || 'Unknown'}</p></div>
              <div className="text-right text-sm text-muted-foreground">{a.creator?.name || 'System'}<br />{new Date(a.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </CardContent></Card>
    </div>
  );
}
