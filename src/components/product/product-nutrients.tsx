import { Card } from '@/components/ui/card';
import { normalizeToArray } from '@/lib/utils/helpers';
import { getTranslation } from '@/lib/utils/translation';
import type { Culture } from '@/types/enums';
import type { Product } from '@/types/product';

interface ProductNutrientsProps {
  product: Product;
  locale: Culture;
}

export function ProductNutrients({ product, locale }: ProductNutrientsProps) {
  const nutrientData =
    product.product.specificationinfolist?.specificationinfo?.nutrientset?.nutrient;

  if (!nutrientData) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Geen voedingswaarden beschikbaar</p>
      </Card>
    );
  }

  const nutrients = normalizeToArray(nutrientData);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Voedingswaarden</h3>
          <p className="text-sm text-muted-foreground">Gemiddelde waarden per portie of per 100g</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Voedingsstof</th>
                <th className="text-right py-3 px-4 font-medium">Waarde</th>
                <th className="text-right py-3 px-4 font-medium">Eenheid</th>
              </tr>
            </thead>
            <tbody>
              {nutrients.map((nutrient, index) => {
                const name = getTranslation(nutrient.name, locale);
                const isEven = index % 2 === 0;
                const nutrientKey = `${name}-${nutrient.quantitytypecode || ''}-${nutrient.value || ''}`;

                return (
                  <tr
                    key={nutrientKey}
                    className={`border-b last:border-b-0 ${isEven ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium">{name}</span>
                      {nutrient.quantitytypecode && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({nutrient.quantitytypecode})
                        </span>
                      )}
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-sm">{nutrient.value}</td>
                    <td className="text-right py-3 px-4 text-sm text-muted-foreground">
                      {nutrient.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Additional info */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>
            * De voedingswaarden zijn gebaseerd op de beschikbare productinformatie en kunnen
            variëren per partij.
          </p>
        </div>
      </div>
    </Card>
  );
}
