import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try { await signIn(form.email, form.password); router.push('/dashboard'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Invalid credentials'); }
    finally { setIsLoading(false); }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to sign in</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoComplete="email" /></div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" /></div>
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Checkbox id="remember" checked={form.rememberMe} onCheckedChange={c => setForm({ ...form, rememberMe: c as boolean })} /><Label htmlFor="remember" className="text-sm">Remember me</Label></div><Link href="/forgot-password" className="text-sm underline">Forgot password?</Link></div>
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</Button>
        </form>
      </CardContent>
      <CardFooter><p className="text-sm text-muted-foreground">No account? <Link href="/signup" className="underline">Sign up</Link></p></CardFooter>
    </Card>
  );
}
