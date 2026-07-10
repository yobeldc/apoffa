import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export function SignupForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', agreeTerms: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!form.agreeTerms) { setError('You must agree to the terms'); return; }
    setIsLoading(true);
    try { await signUp(form.email, form.password, form.name); router.push('/dashboard'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
    finally { setIsLoading(false); }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Get started with APOffa</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
          <div className="space-y-2"><Label htmlFor="confirm">Confirm Password</Label><Input id="confirm" type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required /></div>
          <div className="flex items-center gap-2"><Checkbox id="terms" checked={form.agreeTerms} onCheckedChange={c => setForm({ ...form, agreeTerms: c as boolean })} /><Label htmlFor="terms" className="text-sm">I agree to the <Link href="/terms" className="underline">Terms</Link></Label></div>
          <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create account'}</Button>
        </form>
      </CardContent>
      <CardFooter><p className="text-sm text-muted-foreground">Already have an account? <Link href="/login" className="underline">Sign in</Link></p></CardFooter>
    </Card>
  );
}
