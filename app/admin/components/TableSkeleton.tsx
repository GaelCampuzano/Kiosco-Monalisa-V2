import { motion } from 'framer-motion';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

export function TableSkeleton({ columns = 4, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-white/5">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="p-4">
              <motion.div
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="h-8 w-full bg-monalisa-silver/10 rounded-sm"
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
