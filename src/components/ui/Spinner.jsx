import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { cn } from '../../lib/cn';

const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-xl' };

export default function Spinner({ size = 'md', className }) {
  return (
    <FontAwesomeIcon
      icon={faSpinner}
      spin
      className={cn(sizes[size], className)}
      aria-hidden="true"
    />
  );
}
