import { cn } from '../../lib/cn';

export default function PageContainer({ className, children }) {
  return <div className={cn('mx-auto w-full max-w-7xl', className)}>{children}</div>;
}
