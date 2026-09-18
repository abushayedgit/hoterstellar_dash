import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-md text-center">
        <p className="text-3xl font-bold text-text-primary">404</p>
        <h1 className="mt-2 text-lg font-semibold text-text-primary">Page not found</h1>
        <p className="mt-1 text-sm text-text-secondary">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-5 flex justify-center">
          <Link to="/dashboard">
            <Button variant="primary">Back to dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
