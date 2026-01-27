import { Card } from '@/components/ui/card';
import type { Culture } from '@/types/enums';
import type { Product } from '@/types/product';
import { Box, Package, Truck } from 'lucide-react';

interface ProductLogisticsProps {
  product: Product;
  locale: Culture;
}

export function ProductLogistics({ product, locale }: ProductLogisticsProps) {
  const logisticInfo = product.product.logisticinfolist?.logisticinfo;

  if (!logisticInfo) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Geen logistieke informatie beschikbaar</p>
      </Card>
    );
  }

  // Note: The actual logistic data structure from the API may differ
  // This is a placeholder implementation that can be extended
  // when the actual data structure is known

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Logistieke informatie</h3>
          <p className="text-sm text-muted-foreground">Verpakking en verzending details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Packaging Info */}
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Package className="h-5 w-5" />
              <h4 className="font-medium">Verpakking</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Materiaal:</span>
                <span className="font-medium">-</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Truck className="h-5 w-5" />
              <h4 className="font-medium">Verzending</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gewicht:</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Afmetingen:</span>
                <span className="font-medium">-</span>
              </div>
            </div>
          </div>

          {/* Storage Info */}
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Box className="h-5 w-5" />
              <h4 className="font-medium">Opslag</h4>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperatuur:</span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Houdbaarheid:</span>
                <span className="font-medium">-</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            * Logistieke informatie kan variëren per locatie en leverancier. Neem contact op voor
            specifieke details.
          </p>
        </div>
      </div>
    </Card>
  );
}
