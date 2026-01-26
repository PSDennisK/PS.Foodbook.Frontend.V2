# FASE 6: UI/UX POLISH - Claude Code Prompt

**Fase:** 6 - UI/UX Polish  
**Duur:** 1 week  
**Doel:** User experience verbetering  

## DOEL
Polish de UI, verbeter accessibility, en optimaliseer performance.

## DEEL 1: LOADING & ERROR STATES

### Skeletons
```typescript
// src/components/ui/product-skeleton.tsx
export function ProductSkeleton() {
  return (
    <Card>
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  );
}
```

### Empty States
```typescript
// src/components/ui/empty-state.tsx
export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <SearchX className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
```

## DEEL 2: ACCESSIBILITY

### Keyboard Navigation
```typescript
// Add to all interactive elements:
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  aria-label="Clear filters"
>
```

### ARIA Labels
```typescript
// Add to all images, buttons, links:
<Image 
  src={image} 
  alt={name}
  aria-describedby="product-description"
/>

<button aria-label="Share productsheet">
  <Share2 />
</button>
```

### Focus Management
```typescript
// src/hooks/use-focus-trap.ts
export function useFocusTrap(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    // Trap focus within element
  }, [ref]);
}
```

## DEEL 3: RESPONSIVE DESIGN

### Breakpoints
```typescript
// Update components for mobile-first:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {products.map(product => <ProductCard key={product.id} product={product} />)}
</div>
```

### Mobile Navigation
```typescript
// src/components/layout/mobile-nav.tsx
export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        {/* Navigation items */}
      </SheetContent>
    </Sheet>
  );
}
```

## DEEL 4: PERFORMANCE

### Image Optimization
```typescript
// Use Next.js Image everywhere:
<Image
  src={productImage}
  alt={name}
  width={300}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

### Code Splitting
```typescript
// Lazy load heavy components:
const ProductDetail = lazy(() => import('@/components/product/product-detail'));

<Suspense fallback={<ProductSkeleton />}>
  <ProductDetail product={product} />
</Suspense>
```

### Bundle Analysis
```bash
npm install @next/bundle-analyzer
# Add to next.config.ts:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

# Run: ANALYZE=true npm run build
```

## DEEL 5: ANIMATIONS

### Framer Motion (optional)
```bash
npm install framer-motion
```

```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <ProductCard product={product} />
</motion.div>
```

## OUTPUT
- ✅ Loading skeletons
- ✅ Empty states
- ✅ Error states
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Mobile responsive
- ✅ Image optimization
- ✅ Code splitting

## VERIFICATION
```bash
# Lighthouse audit:
npm run build
npm start
# Open Chrome DevTools → Lighthouse → Run audit

# Targets:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

# Manual testing:
1. Tab through all pages - focus visible
2. Screen reader - all content accessible
3. Mobile - all features work
4. Slow 3G - loads reasonably
```

**Volgende stap:** Fase 7 - Testing & QA
