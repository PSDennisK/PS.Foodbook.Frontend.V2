'use client';

import type { Culture } from '@/types/enums';
import type { SearchProduct } from '@/types/filter';
import { motion } from 'framer-motion';
import { ProductCard } from './product-card';

interface ProductCardAnimatedProps {
  product: SearchProduct;
  locale: Culture;
  index?: number;
}

export function ProductCardAnimated({ product, locale, index = 0 }: ProductCardAnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05, // Stagger effect
        ease: 'easeOut',
      }}
      whileHover={{ y: -4 }}
    >
      <ProductCard product={product} locale={locale} />
    </motion.div>
  );
}
