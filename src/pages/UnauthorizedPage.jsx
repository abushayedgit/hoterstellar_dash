import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <Card className="w-full max-w-md text-center">
        <FontAwesomeIcon icon={faLock} className="text-3xl text-danger" />
        <h1 className="mt-3 text-xl font-semibold text-text-primary">Access denied</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your account does not have permission to view this page.
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
