import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { normalizeToArray } from '@/lib/utils/helpers';
import type { Product } from '@/types/product';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';

interface ProductDocumentsProps {
  product: Product;
}

export function ProductDocuments({ product }: ProductDocumentsProps) {
  const assetinfo = product.product?.logisticinfolist?.logisticinfo?.assetinfolist?.assetinfo;

  if (!assetinfo) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Geen documenten beschikbaar</p>
      </Card>
    );
  }

  const assets = normalizeToArray(assetinfo);

  // Separate images from other documents
  const images = assets.filter((asset) => asset.downloadurl);
  const documents = assets.filter((asset) => !asset.downloadurl);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Documenten en afbeeldingen</h3>
          <p className="text-sm text-muted-foreground">
            Download productafbeeldingen en documentatie
          </p>
        </div>

        {/* Product Images */}
        {images.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Productafbeeldingen ({images.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {images.map((asset, index) => {
                const isHero = asset.isheroimage === 'true';
                const highResUrl = asset.highresolutionimage?.downloadurl;
                const lowResUrl = asset.lowresolutionimage?.downloadurl;
                const mainUrl = asset.downloadurl;
                const assetKey = mainUrl || highResUrl || lowResUrl || `image-${index}`;

                return (
                  <div
                    key={assetKey}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Afbeelding {index + 1}
                          {isHero && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Hero
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {highResUrl ? 'Hoge resolutie beschikbaar' : 'Standaard resolutie'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {lowResUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={lowResUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Laag
                          </a>
                        </Button>
                      )}
                      {highResUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={highResUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Hoog
                          </a>
                        </Button>
                      )}
                      {mainUrl && !highResUrl && !lowResUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={mainUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Documents */}
        {documents.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documenten ({documents.length})
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {documents.map((doc, index) => {
                const docKey =
                  doc.downloadurl || doc.highresolutionimage?.downloadurl || `doc-${index}`;
                return (
                  <div
                    key={docKey}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Document {index + 1}</p>
                        <p className="text-xs text-muted-foreground">PDF, Certificate, etc.</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {images.length === 0 && documents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Geen documenten beschikbaar voor dit product</p>
          </div>
        )}
      </div>
    </Card>
  );
}
