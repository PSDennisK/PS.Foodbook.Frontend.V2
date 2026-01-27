'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { EmptyState } from './empty-state';

interface EmptyStateAnimatedProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyStateAnimated(props: EmptyStateAnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <EmptyState {...props} />
    </motion.div>
  );
}
