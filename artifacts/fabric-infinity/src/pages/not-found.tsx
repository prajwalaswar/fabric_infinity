import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
        <h1 className="font-serif text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          The artisan seems to have moved this beautiful creation to another room. The page you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button size="lg" className="px-8">Return to Homepage</Button>
        </Link>
      </div>
    </StoreLayout>
  );
}
