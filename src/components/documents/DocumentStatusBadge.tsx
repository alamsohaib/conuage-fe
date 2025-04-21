
import { cn } from "@/lib/utils";

interface DocumentStatusBadgeProps {
  status: string;
  className?: string;
}

const DocumentStatusBadge = ({ status, className }: DocumentStatusBadgeProps) => {
  const getStatusStyles = () => {
    switch(status) {
      case 'added':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'processed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  return (
    <span className={cn(`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`, className)}>
      {status}
    </span>
  );
};

export default DocumentStatusBadge;
