'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Link } from '@/i18n/routing';
import { Home, Menu, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('common');

  const navigationItems = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/product', label: t('search'), icon: Search },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          aria-label={t('openMenu') || 'Open menu'}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>PS Foodbook</SheetTitle>
          <SheetDescription>{t('navigation') || 'Navigation'}</SheetDescription>
        </SheetHeader>
        <nav
          className="flex flex-col gap-4 mt-6"
          aria-label={t('mobileNavigation') || 'Mobile navigation'}
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-base font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
