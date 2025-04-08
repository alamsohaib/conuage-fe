
interface DocumentStatusBadgeProps {
  status: string;
}

const DocumentStatusBadge = ({ status }: DocumentStatusBadgeProps) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status === 'added' 
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
        : status === 'processed' 
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    }`}>
      {status}
    </span>
  );
};

export default DocumentStatusBadge;
