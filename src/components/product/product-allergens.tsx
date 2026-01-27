import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { normalizeToArray } from '@/lib/utils/helpers';
import { getTranslation } from '@/lib/utils/translation';
import type { Culture } from '@/types/enums';
import type { Product } from '@/types/product';

interface ProductAllergensProps {
  product: Product;
  locale: Culture;
}

// Allergen level codes mapping
const allergenLevelConfig = {
  '1': { label: 'Bevat', color: 'bg-red-100 text-red-800 border-red-200' },
  '2': { label: 'Kan bevatten', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  '3': { label: 'Vrij van', color: 'bg-green-100 text-green-800 border-green-200' },
};

export function ProductAllergens({ product, locale }: ProductAllergensProps) {
  const allergenData =
    product.product.specificationinfolist?.specificationinfo?.allergenset?.allergen;

  if (!allergenData) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Geen allergeninformatie beschikbaar</p>
      </Card>
    );
  }

  const allergens = normalizeToArray(allergenData);

  // Group allergens by level
  const groupedAllergens = allergens.reduce(
    (acc, allergen) => {
      const level = allergen.levelcode || '3';
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(allergen);
      return acc;
    },
    {} as Record<string, typeof allergens>
  );

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Allergenen informatie</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Deze informatie geeft aan welke allergenen in dit product zitten of kunnen zitten.
          </p>
        </div>

        {/* Allergens by level */}
        {Object.entries(allergenLevelConfig).map(([level, config]) => {
          const allergensForLevel = groupedAllergens[level];
          if (!allergensForLevel || allergensForLevel.length === 0) return null;

          return (
            <div key={level}>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Badge variant="outline" className={config.color}>
                  {config.label}
                </Badge>
                <span className="text-sm text-muted-foreground">({allergensForLevel.length})</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allergensForLevel.map((allergen) => {
                  const name = getTranslation(allergen.name, locale);
                  const allergenKey = `${level}-${name}-${allergen.allergentype || ''}`;
                  return (
                    <div key={allergenKey} className="border rounded-md p-3 bg-gray-50">
                      <p className="text-sm font-medium">{name}</p>
                      {allergen.allergentype && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {allergen.allergentype}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="border-t pt-4 mt-6">
          <p className="text-xs font-medium mb-2 text-muted-foreground">Legenda:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(allergenLevelConfig).map(([level, config]) => (
              <Badge key={level} variant="outline" className={config.color}>
                {config.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
