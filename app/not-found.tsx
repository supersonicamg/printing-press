'use client';

import { Button } from '../components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'hsl(var(--background))',
      flexDirection: 'column',
      gap: 16,
      textAlign: 'center',
      padding: 24
    }}>
      <div style={{ fontSize: 80, fontWeight: 700, color: 'hsl(var(--primary))' }}>404</div>
      <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Page Not Found</h1>
      <p style={{ color: 'hsl(var(--muted-foreground))', maxWidth: 400 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
