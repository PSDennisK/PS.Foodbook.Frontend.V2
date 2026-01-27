'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { generatePermalinkSignature } from '@/lib/auth/permalink';
import { buildProductSheetUrl } from '@/lib/utils/url';
import { Check, Copy, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  productId: string;
  productName: string;
  expiresInHours?: number;
}

export function ShareButton({ productId, productName, expiresInHours = 24 }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    const expiresInSeconds = expiresInHours * 3600;
    const params = await generatePermalinkSignature(productId, expiresInSeconds);

    const slug = buildProductSheetUrl(productId, productName);
    const url = new URL(slug, window.location.origin);
    url.searchParams.set('pspid', params.productId);
    url.searchParams.set('psexp', params.expires);
    url.searchParams.set('pssig', params.signature);

    setShareUrl(url.toString());
    setOpen(true);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <>
      <Button
        onClick={generateShareLink}
        variant="outline"
        aria-label="Deel productsheet"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            generateShareLink();
          }
        }}
      >
        <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
        Delen
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deel productsheet</DialogTitle>
            <DialogDescription>
              Deze link is geldig voor {expiresInHours} uur. Iedereen met deze link kan de
              productsheet bekijken.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="font-mono text-sm"
                onClick={(e) => e.currentTarget.select()}
                aria-label="Deel link"
                aria-describedby="share-url-description"
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              className="shrink-0"
              aria-label={copied ? 'Link gekopieerd' : 'Kopieer link naar klembord'}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">{copied ? 'Gekopieerd' : 'Kopieer'}</span>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              De link verloopt op:{' '}
              {new Date(Date.now() + expiresInHours * 3600 * 1000).toLocaleString('nl-NL')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
