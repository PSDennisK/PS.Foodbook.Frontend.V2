'use client';

import { Card } from '@/components/ui/card';
import { normalizeToArray } from '@/lib/utils/helpers';
import { getProductImage } from '@/lib/utils/image';
import type { Product } from '@/types/product';
import Image from 'next/image';
import { useState } from 'react';

interface ProductImageProps {
  product: Product;
}

const NO_IMAGE = '/images/no-image.png';

export function ProductImage({ product }: ProductImageProps) {
  const assetinfo = product.product?.logisticinfolist?.logisticinfo?.assetinfolist?.assetinfo;
  const assets = normalizeToArray(assetinfo);

  // Find hero image or use first image
  const heroImage = assets.find((a) => a.isheroimage === 'true') || assets[0];
  const mainImageUrl =
    heroImage?.highresolutionimage?.downloadurl ||
    heroImage?.downloadurl ||
    getProductImage(product, 'large');

  const [selectedImage, setSelectedImage] = useState(mainImageUrl);

  // Get thumbnail images
  const thumbnails = assets.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Card className="overflow-hidden bg-gray-50">
        <div className="relative aspect-square">
          <Image
            src={selectedImage || NO_IMAGE}
            alt="Product afbeelding"
            fill
            className="object-contain p-4"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </Card>

      {/* Thumbnail Gallery */}
      {thumbnails.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {thumbnails.map((asset, index) => {
            const thumbUrl = asset.lowresolutionimage?.downloadurl || asset.downloadurl || NO_IMAGE;
            const isSelected = thumbUrl === selectedImage;
            const assetKey =
              asset.downloadurl || asset.lowresolutionimage?.downloadurl || `asset-${index}`;

            return (
              <button
                key={assetKey}
                type="button"
                onClick={() => setSelectedImage(thumbUrl)}
                className={`relative aspect-square border-2 rounded-md overflow-hidden transition-all ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary ring-offset-2'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Image
                  src={thumbUrl}
                  alt={`Product afbeelding ${index + 1}`}
                  fill
                  className="object-contain p-2"
                  sizes="(max-width: 768px) 25vw, 12vw"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
