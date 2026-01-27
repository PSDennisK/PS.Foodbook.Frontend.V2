'use client';

import { Button } from '@/components/ui/button';
import { buildProductSheetUrl } from '@/lib/utils/url';
import type { Culture } from '@/types/enums';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface DownloadPdfButtonProps {
  productId: string;
  productName: string;
  locale: Culture;
}

export function DownloadPdfButton({ productId, productName, locale }: DownloadPdfButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);

    try {
      // Extract locale prefix (nl-NL -> nl, en-US -> en)
      const localePrefix = locale.split('-')[0];
      const slug = buildProductSheetUrl(productId, productName);
      const pdfUrl = `/${localePrefix}${slug}/pdf`;

      // Open PDF in new window/tab
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      // Reset loading state after a short delay
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      PDF
    </Button>
  );
}
