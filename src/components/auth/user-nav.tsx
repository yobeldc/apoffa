import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Settings, Shield } from 'lucide-react';
import Link from 'next/link';

export function UserNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild><Link href="/login">Sign in</Link></Button>
        <Button size="sm" asChild><Link href="/signup">Get Started</Link></Button>
      </div>
    );
  }

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Link href="/profile" className="flex items-center gap-2">
        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback></Avatar>
        <span className="text-sm font-medium hidden md:block">{user.name || user.email}</span>
      </Link>
      {user.role === 'admin' && (
        <Button variant="ghost" size="sm" asChild><Link href="/admin"><Shield className="h-4 w-4 mr-1" />Admin</Link></Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => signOut().then(() => router.push('/'))}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
